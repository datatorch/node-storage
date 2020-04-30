# Storage Google Cloud Platform

This package exports an implementation of `Storage` that allows using google
cloud platform storage buckets as a generic storage unit.

## Usage

```typescript
import { GoogleCloudStorage, GoogleCloudStorageOptions } from 'storage-gcp'

const options: GoogleCloudStorageOptions = {
  // ...
}
const storage = new GoogleCloudStorage(options)
```

Optional: Register component with `StorageFactory`.

```javascript
import { getStorageFactory } from 'storage-core'
import { GoogleCloudStorage } from 'storage-gcp'

getStorageFactory().register('google-cloud', GoogleCloudStorage)

//...

const options: GoogleCloudStorageOptions = {
  // ...
}
const storage = getStorageFactory().create({ type: 'google-cloud', ...options })
```
