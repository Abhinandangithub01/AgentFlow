// AWS Lambda Function for Document Processing
// Extracts text from uploaded documents and triggers vectorization

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

// For PDF processing (install in Lambda layer)
// const pdfParse = require('pdf-parse');

exports.handler = async (event) => {
  console.log('Document processor triggered:', JSON.stringify(event, null, 2));

  try {
    // Get S3 event details
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    // Get file from S3
    const s3Object = await s3.getObject({
      Bucket: bucket,
      Key: key,
    }).promise();

    const fileContent = s3Object.Body;
    const contentType = s3Object.ContentType;
    const metadata = s3Object.Metadata;

    console.log('File metadata:', metadata);

    // Extract text based on content type
    let extractedText = '';

    if (contentType === 'text/plain' || contentType === 'text/markdown') {
      extractedText = fileContent.toString('utf-8');
    } else if (contentType === 'application/pdf') {
      // For PDF processing, you would use pdf-parse
      // const pdfData = await pdfParse(fileContent);
      // extractedText = pdfData.text;
      
      // Placeholder for now
      extractedText = fileContent.toString('utf-8');
      console.log('PDF processing - using placeholder');
    } else if (contentType.includes('word')) {
      // For Word docs, you would use mammoth or similar
      // Placeholder for now
      extractedText = 'Word document processing not yet implemented';
      console.log('Word processing - using placeholder');
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    console.log(`Extracted text length: ${extractedText.length} characters`);

    // Chunk the text (simple chunking - 1000 chars with 200 overlap)
    const chunks = chunkText(extractedText, 1000, 200);
    console.log(`Created ${chunks.length} chunks`);

    // Get document ID from metadata
    const knowledgeBaseId = metadata.knowledgebaseid;
    const userId = metadata.userid;
    const documentId = key.split('/').pop().split('.')[0];

    if (!knowledgeBaseId || !userId) {
      throw new Error('Missing required metadata: knowledgeBaseId or userId');
    }

    // Store chunks in DynamoDB for vectorization
    const tableName = process.env.DYNAMODB_VECTORS_TABLE || 'AgentFlow-Vectors';
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkId = `${documentId}_chunk_${i}`;
      
      await dynamodb.put({
        TableName: tableName,
        Item: {
          PK: `KB#${knowledgeBaseId}`,
          SK: `CHUNK#${chunkId}`,
          id: chunkId,
          knowledgeBaseId,
          documentId,
          content: chunks[i],
          chunkIndex: i,
          totalChunks: chunks.length,
          status: 'pending_vectorization',
          createdAt: new Date().toISOString(),
        },
      }).promise();
    }

    console.log(`Stored ${chunks.length} chunks in DynamoDB`);

    // Update document status
    const kbTableName = process.env.DYNAMODB_KNOWLEDGE_BASES_TABLE || 'AgentFlow-KnowledgeBases';
    
    await dynamodb.update({
      TableName: kbTableName,
      Key: {
        PK: `KB#${knowledgeBaseId}`,
        SK: `DOC#${documentId}`,
      },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt, chunksCreated = :chunks',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'chunked',
        ':updatedAt': new Date().toISOString(),
        ':chunks': chunks.length,
      },
    }).promise();

    console.log('Document status updated to chunked');

    // Trigger vectorization (you would call another Lambda or API here)
    // For now, we'll mark it as ready for the next step
    console.log('Document processing complete');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Document processed successfully',
        documentId,
        chunks: chunks.length,
      }),
    };
  } catch (error) {
    console.error('Error processing document:', error);

    // Update document status to error
    try {
      const metadata = event.Records[0].s3.object.metadata || {};
      const knowledgeBaseId = metadata.knowledgebaseid;
      const key = event.Records[0].s3.object.key;
      const documentId = key.split('/').pop().split('.')[0];

      if (knowledgeBaseId && documentId) {
        const kbTableName = process.env.DYNAMODB_KNOWLEDGE_BASES_TABLE || 'AgentFlow-KnowledgeBases';
        
        await dynamodb.update({
          TableName: kbTableName,
          Key: {
            PK: `KB#${knowledgeBaseId}`,
            SK: `DOC#${documentId}`,
          },
          UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt, error = :error',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':status': 'error',
            ':updatedAt': new Date().toISOString(),
            ':error': error.message,
          },
        }).promise();
      }
    } catch (updateError) {
      console.error('Error updating document status:', updateError);
    }

    throw error;
  }
};

// Helper function to chunk text
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}
