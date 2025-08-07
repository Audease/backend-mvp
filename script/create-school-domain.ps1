# scripts/create-school-domain.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$SchoolSubdomain,
    [string]$ServiceName = "frontend-mvp-main",
    [string]$Region = "us-central1",
    [string]$ProjectId = "setting-up-email-424909",
    [string]$DnsZone = "audease-dev",
    [string]$BaseDomain = "audease.co.uk"
)

$ErrorActionPreference = "Stop"
$domain = "$SchoolSubdomain.$BaseDomain"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Creating Domain Mapping for: $domain" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Step 1: Validate inputs
Write-Host "`n[1/5] Validating inputs..." -ForegroundColor Yellow

if (-not ($SchoolSubdomain -match "^[a-z0-9][a-z0-9-]*[a-z0-9]$")) {
    Write-Error "Invalid subdomain format. Must contain only lowercase letters, numbers, and hyphens."
    exit 1
}

if ($SchoolSubdomain.Length -lt 3 -or $SchoolSubdomain.Length -gt 30) {
    Write-Error "Subdomain must be between 3 and 30 characters long."
    exit 1
}

Write-Host "✅ Subdomain format is valid" -ForegroundColor Green

# Step 2: Check if domain already exists
Write-Host "`n[2/5] Checking for existing domain mapping..." -ForegroundColor Yellow

try {
    $existingMapping = gcloud beta run domain-mappings describe --domain=$domain --region=$Region --project=$ProjectId --format="value(metadata.name)" 2>$null
    if ($existingMapping) {
        Write-Host "⚠️  Domain mapping already exists for $domain" -ForegroundColor Yellow
        $continue = Read-Host "Do you want to continue anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Host "Operation cancelled." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "✅ No existing mapping found" -ForegroundColor Green
    }
} catch {
    Write-Host "✅ No existing mapping found" -ForegroundColor Green
}

# Step 3: Create Cloud Run domain mapping
Write-Host "Creating Cloud Run domain mapping..." -ForegroundColor Yellow

$cloudRunResult = gcloud beta run domain-mappings create `
    --service=$ServiceName `
    --domain=$domain `
    --region=$Region `
    --project=$ProjectId `
    --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cloud Run domain mapping created successfully" -ForegroundColor Green
} else {
    Write-Error "❌ Failed to create Cloud Run domain mapping with exit code $LASTEXITCODE"
    Write-Host "Output: $cloudRunResult" -ForegroundColor Red
    exit 1
}

# Step 4: Create DNS record
Write-Host "`n[4/5] Creating DNS CNAME record..." -ForegroundColor Yellow

try {
    # Check if DNS record already exists
    $existingDns = gcloud dns record-sets list --zone=$DnsZone --name="$domain." --type=CNAME --format="value(name)" 2>$null
    
    if ($existingDns) {
        Write-Host "⚠️  DNS record already exists for $domain" -ForegroundColor Yellow
    } else {
        $dnsResult = gcloud dns record-sets create "$domain." `
            --zone=$DnsZone `
            --type=CNAME `
            --ttl=300 `
            --rrdatas="ghs.googlehosted.com." `
            --project=$ProjectId `
            --quiet `
            2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ DNS CNAME record created successfully" -ForegroundColor Green
        } else {
            throw "DNS record creation failed with exit code $LASTEXITCODE"
        }
    }
} catch {
    Write-Error "❌ Failed to create DNS record: $($_.Exception.Message)"
    Write-Host "Output: $dnsResult" -ForegroundColor Red
    
    # Cleanup Cloud Run mapping on DNS failure
    Write-Host "`nCleaning up Cloud Run mapping..." -ForegroundColor Yellow
    try {
        gcloud run domain-mappings delete --domain=$domain --region=$Region --project=$ProjectId --quiet 2>$null
        Write-Host "✅ Cleanup completed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Cleanup may be incomplete" -ForegroundColor Yellow
    }
    exit 1
}

# Step 5: Verify setup
Write-Host "`n[5/5] Verifying domain mapping..." -ForegroundColor Yellow

Start-Sleep -Seconds 5

try {
    $mappingStatus = gcloud beta run domain-mappings describe --domain=$domain --region=$Region --project=$ProjectId --format="value(status.conditions[0].status)" 2>$null
    
    if ($mappingStatus -eq "True") {
        Write-Host "✅ Domain mapping is ready" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Domain mapping is still being configured (Status: $mappingStatus)" -ForegroundColor Yellow
        Write-Host "This is normal and should complete within 5-10 minutes." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not verify mapping status immediately" -ForegroundColor Yellow
}

# Final summary
Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "DOMAIN SETUP COMPLETED" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Domain: $domain" -ForegroundColor White
Write-Host "Cloud Run Service: $ServiceName" -ForegroundColor White
Write-Host "Region: $Region" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "- SSL certificate will be automatically provisioned (5-10 minutes)" -ForegroundColor White
Write-Host "- DNS propagation may take up to 30 minutes globally" -ForegroundColor White
Write-Host "- Test with: curl -I https://$domain" -ForegroundColor White

# Optional: Monitor setup
$monitor = Read-Host "`nWould you like to monitor the SSL certificate setup? (y/N)"
if ($monitor -eq "y" -or $monitor -eq "Y") {
    Write-Host "`nMonitoring SSL certificate setup..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le 12; $i++) {
        Write-Host "[$i/12] Checking SSL certificate..." -ForegroundColor Cyan
        
        try {
            $response = Invoke-WebRequest -Uri "https://$domain" -Method Head -TimeoutSec 10 -ErrorAction Stop
            Write-Host "✅ SSL certificate is ready! (Status: $($response.StatusCode))" -ForegroundColor Green
            Write-Host "✅ $domain is fully operational!" -ForegroundColor Green
            break
        } catch {
            if ($i -eq 12) {
                Write-Host "⚠️  SSL certificate not ready yet. This may take longer than expected." -ForegroundColor Yellow
                Write-Host "Check again in a few minutes with: curl -I https://$domain" -ForegroundColor White
            } else {
                Write-Host "⏳ Still waiting... (${i}/12)" -ForegroundColor Yellow
                Start-Sleep -Seconds 30
            }
        }
    }
}

Write-Host "`n🎉 Domain setup process completed!" -ForegroundColor Green