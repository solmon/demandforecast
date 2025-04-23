import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Test controller for development purposes
 * @remarks This controller provides test endpoints for development and system verification
 */
@ApiTags('Test')
@Controller('test')
export class TestController {
  constructor(private readonly config: ConfigService<any>) {}

  /**
   * Basic test endpoint that returns a hello world response
   * @returns A simple hello world object
   */
  @Get('1')
  @ApiOperation({ 
    summary: 'Test endpoint',
    description: 'Simple test endpoint that returns a hello world object'
  })
  @ApiResponse({ 
    status: 200,
    description: 'Test completed successfully',
    schema: {
      type: 'object',
      properties: {
        hello: {
          type: 'string',
          example: 'world',
          description: 'A greeting message'
        }
      }
    }
  })
  test1() {
    return { hello: 'world' };
  }
}
