import * as s3 from '@aws-sdk/client-s3'

type SpaceCredentials = {
  spaceName: string
  region: string
  accessKey: string
  secretKey: string
}

type SpaceObject = {
  fileName: string
  content: string
  contentType: 'image/svg+xml' | 'text/html'
  contentDisposition: 'inline' | 'attachment'
  ACL: 'public-read' | 'private'
}

export const uploadToSpaces = async (credentials: SpaceCredentials, object: SpaceObject) => {
  const { region, spaceName, accessKey, secretKey } = credentials
  const { ACL, contentType, contentDisposition, content, fileName } = object

  const s3Client = new s3.S3Client({
    forcePathStyle: false,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    endpoint: `https://${region}.digitaloceanspaces.com`,
  })

  await s3Client.send(
    new s3.PutObjectCommand({
      Bucket: spaceName,
      Key: fileName,
      Body: content,
      ACL,
      ContentType: contentType,
      ContentDisposition: contentDisposition,
    })
  )

  const objectUrl = `https://${spaceName}.${region}.digitaloceanspaces.com/${fileName}`
  return { objectUrl }
}
