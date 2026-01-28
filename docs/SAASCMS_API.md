# SaasCMS API Publishing Endpoint

This document describes how to use the SaasCMS API endpoint to publish content programmatically from external applications.

## Endpoint

```
POST /api/cms/publish-api
```

## Authentication

The API requires a secret key to be passed in the request headers:

```
X-API-Secret-Key: your-secret-key-here
```

**Important:** Set your secret key in `.env.local`:
```bash
CMS_API_SECRET_KEY=your-secret-key-change-this-in-production
```

## Request Format

### Headers
```
Content-Type: application/json
X-API-Secret-Key: your-secret-key-here
```

### Body

```json
{
  "content": {
    "title": "Page Title",
    "body": "<p>HTML content goes here</p>",
    "author": "Author Name (optional)",
    "metaTitle": "SEO Title (optional)",
    "metaDescription": "SEO Description (optional)",
    "urlSlug": "page-url-slug (optional)",
    "featuredMedia": "image-url (optional)"
  },
  "options": {
    "container": "container-guid-required",
    "status": "draft|published|scheduled (default: draft)",
    "locale": "en-US (default)",
    "contentType": "OpalPage (default)",
    "isRoutable": true,
    "delayPublishUntil": "2024-12-31T23:59:59Z (optional, for scheduled)"
  }
}
```

## Example Request

### Using cURL

```bash
curl -X POST https://your-domain.com/api/cms/publish-api \
  -H "Content-Type: application/json" \
  -H "X-API-Secret-Key: your-secret-key-here" \
  -d '{
    "content": {
      "title": "Welcome to Our New Product",
      "body": "<h1>Welcome</h1><p>This is our new product page.</p>",
      "author": "Marketing Team",
      "metaTitle": "New Product Launch - Company Name",
      "metaDescription": "Discover our latest product innovation",
      "urlSlug": "new-product-launch"
    },
    "options": {
      "container": "abc123-def456-ghi789",
      "status": "published",
      "locale": "en-US",
      "isRoutable": true
    }
  }'
```

### Using JavaScript/TypeScript

```typescript
const publishContent = async () => {
  const response = await fetch('https://your-domain.com/api/cms/publish-api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Secret-Key': 'your-secret-key-here'
    },
    body: JSON.stringify({
      content: {
        title: 'Welcome to Our New Product',
        body: '<h1>Welcome</h1><p>This is our new product page.</p>',
        author: 'Marketing Team',
        metaTitle: 'New Product Launch - Company Name',
        metaDescription: 'Discover our latest product innovation',
        urlSlug: 'new-product-launch'
      },
      options: {
        container: 'abc123-def456-ghi789',
        status: 'published',
        locale: 'en-US',
        isRoutable: true
      }
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Published successfully:', result.data);
  } else {
    console.error('Failed to publish:', result.error);
  }
};
```

### Using Python

```python
import requests
import json

url = "https://your-domain.com/api/cms/publish-api"
headers = {
    "Content-Type": "application/json",
    "X-API-Secret-Key": "your-secret-key-here"
}
data = {
    "content": {
        "title": "Welcome to Our New Product",
        "body": "<h1>Welcome</h1><p>This is our new product page.</p>",
        "author": "Marketing Team",
        "metaTitle": "New Product Launch - Company Name",
        "metaDescription": "Discover our latest product innovation",
        "urlSlug": "new-product-launch"
    },
    "options": {
        "container": "abc123-def456-ghi789",
        "status": "published",
        "locale": "en-US",
        "isRoutable": True
    }
}

response = requests.post(url, headers=headers, json=data)
result = response.json()

if result.get("success"):
    print("Published successfully:", result.get("data"))
else:
    print("Failed to publish:", result.get("error"))
```

## Response Format

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "contentLink": {
      "id": 123,
      "workId": 0,
      "guidValue": "abc123-def456-ghi789",
      "providerName": "CatalogContent",
      "url": "/en/new-product-launch/"
    },
    "name": "Welcome to Our New Product",
    "language": {
      "name": "en-US"
    },
    "status": "Published"
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized: Invalid or missing API secret key"
}
```

#### 400 Bad Request
```json
{
  "error": "Missing required content fields: title and body are required"
}
```

```json
{
  "error": "Missing required options: container is required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to publish content: 500",
  "details": { ... }
}
```

## Required Fields

### Content
- `title` (string, required): The page title
- `body` (string, required): HTML content

### Options
- `container` (string, required): The GUID of the parent container/page

## Optional Fields

### Content
- `author` (string): Content author name
- `metaTitle` (string): SEO meta title
- `metaDescription` (string): SEO meta description
- `urlSlug` (string): URL-friendly slug (auto-generated from title if not provided)
- `featuredMedia` (string): URL to featured image

### Options
- `status` (string): "draft", "published", or "scheduled" (default: "draft")
- `locale` (string): Language code (default: "en-US")
- `contentType` (string): Optimizely content type (default: "OpalPage")
- `isRoutable` (boolean): Whether content is routable (default: true)
- `delayPublishUntil` (string): ISO 8601 datetime for scheduled publishing

## Security Best Practices

1. **Never commit the secret key** to version control
2. **Use environment variables** to store the secret key
3. **Rotate the secret key** regularly
4. **Use HTTPS** in production
5. **Implement rate limiting** if needed
6. **Log all API access** for audit purposes
7. **Validate all input** on the client side before sending

## Getting Container GUIDs

To get available container GUIDs, you can:

1. Use the manual upload interface at `/cms` and inspect the container dropdown
2. Query the GraphQL endpoint directly
3. Use the Optimizely CMS admin interface

## Troubleshooting

### "Unauthorized" error
- Check that `X-API-Secret-Key` header is included
- Verify the secret key matches the one in `.env.local`

### "Missing required fields" error
- Ensure `content.title` and `content.body` are provided
- Ensure `options.container` is provided

### "Failed to publish" error
- Check that the container GUID is valid
- Verify Optimizely credentials in `.env.local`
- Check that the content type exists in your Optimizely instance

## Support

For issues or questions, please contact the development team.
