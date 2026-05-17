import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private app: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const projectId = this.configService.get('FIREBASE_PROJECT_ID');
      const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
      const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');

      if (!projectId || !privateKey || !clientEmail) {
        this.logger.warn('⚠️  Firebase credentials not configured. FCM disabled.');
        return;
      }

      if (admin.apps.length === 0) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
        });
        this.logger.log('✅ Firebase Admin initialized');
      } else {
        this.app = admin.apps[0];
      }
    } catch (err) {
      this.logger.error('Firebase init error:', err);
    }
  }

  async sendToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    imageUrl?: string,
  ): Promise<boolean> {
    if (!this.app) return false;
    try {
      await admin.messaging(this.app).send({
        token,
        notification: { title, body, ...(imageUrl ? { imageUrl } : {}) },
        data: data || {},
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
      return true;
    } catch (err) {
      this.logger.error(`FCM send to token failed: ${err.message}`);
      return false;
    }
  }

  async sendToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
    imageUrl?: string,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.app || !tokens.length) return { successCount: 0, failureCount: 0 };
    try {
      const response = await admin.messaging(this.app).sendEachForMulticast({
        tokens,
        notification: { title, body, ...(imageUrl ? { imageUrl } : {}) },
        data: data || {},
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
      return { successCount: response.successCount, failureCount: response.failureCount };
    } catch (err) {
      this.logger.error('FCM multicast failed:', err);
      return { successCount: 0, failureCount: tokens.length };
    }
  }

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.app) return false;
    try {
      await admin.messaging(this.app).send({ topic, notification: { title, body }, data: data || {} });
      return true;
    } catch (err) {
      this.logger.error('FCM topic send failed:', err);
      return false;
    }
  }
}
