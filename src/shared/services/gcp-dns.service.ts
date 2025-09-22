// src/shared/services/gcp-dns.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DNS } from '@google-cloud/dns';

@Injectable()
export class GCPDNSService {
  private readonly logger = new Logger(GCPDNSService.name);
  private dns: DNS;
  private zone: any;

  constructor() {
    this.dns = new DNS({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(
          /\\n/g,
          '\n'
        ),
      },
    });

    this.zone = this.dns.zone(process.env.DNS_ZONE_NAME);
  }

  async createSubdomainRecord(subdomain: string): Promise<boolean> {
    try {
      const recordName = `${subdomain}.${process.env.BASE_DOMAIN}.`;
      const record = this.zone.record('A', {
        name: recordName,
        data: process.env.LOAD_BALANCER_IP,
        ttl: 300,
      });

      await this.zone.addRecords(record);
      this.logger.log(`DNS record created for ${recordName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to create DNS record: ${error.message}`);
      return false;
    }
  }

  async deleteSubdomainRecord(subdomain: string): Promise<boolean> {
    try {
      const recordName = `${subdomain}.${process.env.BASE_DOMAIN}.`;
      const record = this.zone.record('A', {
        name: recordName,
        data: process.env.LOAD_BALANCER_IP,
        ttl: 300,
      });

      await this.zone.deleteRecords(record);
      this.logger.log(`DNS record deleted for ${recordName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete DNS record: ${error.message}`);
      return false;
    }
  }

  async verifyDNSRecord(subdomain: string): Promise<boolean> {
    try {
      const recordName = `${subdomain}.${process.env.BASE_DOMAIN}`;
      const records = await this.zone.getRecords({
        name: recordName,
        type: 'A',
      });

      return records[0] && records[0].length > 0;
    } catch (error) {
      this.logger.error(`Failed to verify DNS record: ${error.message}`);
      return false;
    }
  }
}
