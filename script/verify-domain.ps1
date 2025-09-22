# scripts/verify-domains.ps1
param(
    [string[]]$Subdomains,
    [string]$CsvFilePath,
    [int]$TimeoutMinutes = 30
)

function Test-DomainMapping {
    param([string]$domain)
    
    $tests = @{
        DNS = $false
        CloudRun = $false
        SSL = $false
        HTTPSResponse = $false
    }
    
    # Test DNS resolution
    try {
        $dnsResult = Resolve-DnsName -Name $domain -Type CNAME -ErrorAction Stop
        $tests.DNS = $dnsResult.NameHost -eq "ghs.googlehosted.com"
    } catch {
        $tests.DNS = $false
    }
    
    # Test Cloud Run mapping
    try {
        $mappingStatus = gcloud run domain-mappings describe --domain=$domain --region=us-central1 --format="value(status.conditions[0].status)" 2>$null
        $tests.CloudRun = $mappingStatus -eq "True"
    } catch {
        $tests.CloudRun = $false
    }
    
    # Test SSL and HTTPS response
    try {
        $response = Invoke-WebRequest -Uri "https://$domain" -Method Head -TimeoutSec 10 -ErrorAction Stop
        $tests.SSL = $true
        $tests.HTTPSResponse = $response.StatusCode -lt 400
    } catch {
        $tests.SSL = $false
        $tests.HTTPSResponse = $false
    }
    
    return $tests
}

# Get list of domains to test
if ($CsvFilePath) {
    $schools = Import-Csv -Path $CsvFilePath
    $domainsToTest = $schools | ForEach-Object { "$($_.subdomain).audease.co.uk" }
} elseif ($Subdomains) {
    $domainsToTest = $Subdomains | ForEach-Object { "$_.audease.co.uk" }
} else {
    Write-Error "Please provide either -Subdomains or -CsvFilePath parameter"
    exit 1
}

Write-Host "🔍 Starting domain verification for $($domainsToTest.Count) domains..." -ForegroundColor Green
Write-Host "Timeout: $TimeoutMinutes minutes`n" -ForegroundColor Yellow

$results = @()
$startTime = Get-Date

foreach ($domain in $domainsToTest) {
    Write-Host "Testing: $domain" -ForegroundColor Cyan
    
    $domainResult = @{
        Domain = $domain
        DNS = $false
        CloudRun = $false
        SSL = $false
        HTTPSResponse = $false
        Status = "Failed"
        LastChecked = Get-Date
    }
    
    $maxAttempts = 3
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        $tests = Test-DomainMapping -domain $domain
        
        $domainResult.DNS = $tests.DNS
        $domainResult.CloudRun = $tests.CloudRun
        $domainResult.SSL = $tests.SSL
        $domainResult.HTTPSResponse = $tests.HTTPSResponse
        
        if ($tests.DNS -and $tests.CloudRun -and $tests.SSL -and $tests.HTTPSResponse) {
            $domainResult.Status = "Ready"
            Write-Host "  ✅ All tests passed" -ForegroundColor Green
            break
        } elseif ($tests.DNS -and $tests.CloudRun) {
            $domainResult.Status = "SSL Pending"
            Write-Host "  ⏳ DNS and Cloud Run ready, waiting for SSL..." -ForegroundColor Yellow
        } elseif ($tests.CloudRun) {
            $domainResult.Status = "DNS Pending"
            Write-Host "  ⏳ Cloud Run ready, waiting for DNS..." -ForegroundColor Yellow
        } else {
            Write-Host "  ❌ Tests failed (attempt $attempt/$maxAttempts)" -ForegroundColor Red
        }
        
        if ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 10
        }
    }
    
    $results += [PSCustomObject]$domainResult
    
    # Check timeout
    if ((Get-Date) -gt $startTime.AddMinutes($TimeoutMinutes)) {
        Write-Host "`n⏰ Timeout reached. Stopping verification." -ForegroundColor Yellow
        break
    }
}

# Generate report
Write-Host "`n" + "="*80 -ForegroundColor Cyan
Write-Host "DOMAIN VERIFICATION REPORT" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Cyan

$ready = $results | Where-Object { $_.Status -eq "Ready" }
$sslPending = $results | Where-Object { $_.Status -eq "SSL Pending" }
$dnsPending = $results | Where-Object { $_.Status -eq "DNS Pending" }
$failed = $results | Where-Object { $_.Status -eq "Failed" }

Write-Host "Total domains tested: $($results.Count)" -ForegroundColor White
Write-Host "✅ Ready: $($ready.Count)" -ForegroundColor Green
Write-Host "⏳ SSL Pending: $($sslPending.Count)" -ForegroundColor Yellow
Write-Host "⏳ DNS Pending: $($dnsPending.Count)" -ForegroundColor Yellow
Write-Host "❌ Failed: $($failed.Count)" -ForegroundColor Red

if ($ready.Count -gt 0) {
    Write-Host "`n✅ READY DOMAINS:" -ForegroundColor Green
    $ready | ForEach-Object { Write-Host "  - $($_.Domain)" -ForegroundColor Green }
}

if ($sslPending.Count -gt 0) {
    Write-Host "`n⏳ SSL PENDING (should be ready soon):" -ForegroundColor Yellow
    $sslPending | ForEach-Object { Write-Host "  - $($_.Domain)" -ForegroundColor Yellow }
}

if ($dnsPending.Count -gt 0) {
    Write-Host "`n⏳ DNS PENDING (may take up to 30 minutes):" -ForegroundColor Yellow
    $dnsPending | ForEach-Object { Write-Host "  - $($_.Domain)" -ForegroundColor Yellow }
}

if ($failed.Count -gt 0) {
    Write-Host "`n❌ FAILED DOMAINS (need investigation):" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  - $($_.Domain)" -ForegroundColor Red }
}

# Export detailed results
$reportPath = "domain-verification-$(Get-Date -Format 'yyyyMMdd-HHmmss').csv"
$results | Export-Csv -Path $reportPath -NoTypeInformation
Write-Host "`n📄 Detailed report saved to: $reportPath" -ForegroundColor Cyan

Write-Host "`n🎉 Verification completed!" -ForegroundColor Green