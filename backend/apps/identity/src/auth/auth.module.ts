import { Module } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [EmployeesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
