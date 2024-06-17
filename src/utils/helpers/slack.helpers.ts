import { WebClient } from '@slack/web-api';
import { Logger } from '@nestjs/common';

const clientSlack = new WebClient(process.env.SLACK_BOT_TOKEN);

export const sendSlackNotification = async (message: string) => {
  // Check if the environment is production
  if (process.env.NODE_ENV === 'production') {
    try {
      await clientSlack.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
        text: 'New message',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
          },
        ],
      });
    } catch (error) {
      Logger.error(error.message);
    }
  } else {
    Logger.warn('Slack notification not sent (not in production mode)');
  }
};
