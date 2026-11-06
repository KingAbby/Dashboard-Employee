import {
  CreateEmployeeDto,
  IdParamDto,
  ListEmployeesQueryDto,
  Role,
  UpdateEmployeeDto,
  type AuthUser,
} from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EmployeesService } from './employees.service';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_HRD)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  list(@Query() query: ListEmployeesQueryDto) {
    return this.employeesService.list(query);
  }

  @Get('next-code')
  nextCode() {
    return this.employeesService.nextCode();
  }

  @Get(':id')
  detail(@Param() params: IdParamDto) {
    return this.employeesService.detail(params.id);
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param() params: IdParamDto,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.employeesService.update(params.id, dto, user.id);
  }

  /** Soft delete: hanya menonaktifkan akun, data tetap tersimpan. */
  @Delete(':id')
  deactivate(@Param() params: IdParamDto, @CurrentUser() user: AuthUser) {
    return this.employeesService.deactivate(params.id, user.id);
  }
}
