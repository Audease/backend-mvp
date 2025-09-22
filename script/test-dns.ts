// test-dns.ts
import { DNS } from '@google-cloud/dns';

const dns = new DNS({
  projectId: 'setting-up-email-424909',
  credentials: {
    client_email:
      'audease-dns-manager@setting-up-email-424909.iam.gserviceaccount.com',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCu13GVWA/e/DFA\nDVFXwolDxvpit68LLkfD+aB1VU8vSL+8hansXnJPXpzv7Cmu24QsXhcixajtM8db\njqYIgB/e+fOng002Ctt6VsLNAHhDbRkx+W+KhBnt6C4330fPyP6V7eXyP0XePwPQ\nAqeoDLx9qhSIOW01eOKgxbY+m894QNFoOmsp9u9wEkWlvnsXZ5CpD92DpKNCspjP\nVn5RlRv22GoLAJfTjoKb45LqvWYN1P8/qrBnrRM0RtpmvE/06FqqNOqCZDt5+PwG\noiqZrz5DrJs+MatujV2HuEubDToKi6JTAaKXtvV3gBzkWz8e0W/qhGnOY6bJt+Nc\n5HwaGnWvAgMBAAECggEAPQ1NA7W64QXWGsQrvcXX0Zt3DiaO0IwqEiQmJCKUYnH4\nRde0tK1sJAvpKBwimATeG/IFCSbVLHLyr6VZk8lNl7pXGwzN1sumxQrrvdLmq8C6\nVgmAKfGj7j+vd+IXPNa2E1t9eoAeoRMG/UkYCyXbYdQUlFbdLBlYpYQ0dZtJsHb5\nwEkL9ovT1orZ0zrXU+lhgNfCLNE9lm9kZ+5lfl99uZFSH2Enb3edVB7+TA9MFvN6\nNT2R5N7Huvi75x4tdJUJDQM0knADaD6YWMOfVAKKUvqM+9qyiN+GIBruxFsUqYSB\nFAD8tKInvJGWbntQ6zqXG9miiRWSzU2nL41GY7CIEQKBgQDg/crtw/raU1oOtnaR\noBGseGChrRj+D0iFpeUZ5fvUOU9fkFB8aFvWd50lXUETRWHKVDyoXROiC7qhfy3Z\nZS6hYo9pHGww6wxT1QeYn8qrkYWcSOK0torkW7jzsy57yOBQ1cA7RK8Luh00ArCs\n6REZTgfUPbbCuAKl4HtA2Sq/cQKBgQDG8ECDtOLegCe/IAwNQUBi1M/AxffGsnpK\np7EPy9IP+AeTfwfj+JAFea/XHVJwZCT/1MYYtFwfGg5OpEpekZ8o3xI6KQ6OWEn8\nYsITH8RATPtlgzbUcqQNgT/8lKNH0qEJaIPIWZ2kRiZ2fIftZDtJXfNmBQPP6Bxu\nYs4rPYw3HwKBgQDWfx7ILt8o5e4luK6xhvlShDEb8fqxu8BYKiCQ4EGFwl15rgwN\njzB+9upKhO1VggAI9OYfXR0qkCQNc0Iyz9P06BHxE7fRq0TFZ4MmbrC5gLLwnEwG\nHUGtFATv0ROvz4KLjj0GRCTd+UF+JFJrhodWqJ2uKmfim6tqmOjomiG3AQKBgQDF\noIxmir7JzMQvcRWn4UemJsVQOxo/cLReD6KtD4zZwks8cniTNy1T0yQk7gMklcfP\nwj8c8aeGWisWYs1ijwVu49PGpVzJednd+PnVZ7xdKFyh5q0EdfKVW+4F7F8cjZje\nsM4hrS0WsX2qPWIHKYhgBQ40Lg0wb+Q2oL8xY440fwKBgHm9wqURSbP7VGtjEUfB\n8olpB7cpn7Pim9BBvJQCwzy7mqerjcIXAsKOXg9i2KP4EamyNa2yr5Q56fBht7gF\nb8iYwU847YJW2kbpwyzSDHX1Y6fwR3D4CwVMy2iIH+cFWt8rnF3ccD4a3VU0l21t\nReL72MF2JrNACjwdKPKUFD9d\n-----END PRIVATE KEY-----\n'.replace(
        /\\n/g,
        '\n'
      ),
  },
});

async function testConnection() {
  try {
    const zone = dns.zone('audease-dev');
    const [records] = await zone.getRecords();
    console.log('✅ DNS connection successful!');
    console.log(`Found ${records.length} DNS records`);
  } catch (error) {
    console.error('❌ DNS connection failed:', error.message);
  }
}

testConnection();
