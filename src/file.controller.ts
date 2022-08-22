import { Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { FileService } from './file.service';
var AWS = require('aws-sdk');

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 10000000 }),
        new FileTypeValidator({ fileType: 'pdf' }),
      ],
    }),
  ) file: Express.Multer.File) {
    console.log(file);
    AWS.config.update({ accessKeyId: 'my-accesskey-id', secretAccessKey: 'my-secret-access-key' });
    var objectParams = {
      Bucket: 'robin-test-bucket-2022',
      Key: file.originalname,
      Body: file.buffer.toString(),
    };
    var uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
    uploadPromise.then(
      function (res) {
        console.log("Successfully uploaded data to bucket");
      });
  }
}
