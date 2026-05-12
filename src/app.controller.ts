import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRootStatus() {
    return {
      message: 'SkillBridge score engine and tier is live',
      status: 'ok',
    };
  }

  @Get('health')
  getHealthStatus() {
    return {
      message: 'SkillBridge score engine and tier is running',
      status: 'ok',
    };
  }
}
