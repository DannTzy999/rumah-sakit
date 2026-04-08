import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/auth/current-user.decorator";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RequirePermissions } from "../../common/auth/permissions.decorator";
import { PermissionsGuard } from "../../common/auth/permissions.guard";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @RequirePermissions("users.read")
  @Get()
  list() {
    return this.users.list();
  }

  @RequirePermissions("users.read")
  @Get(":id")
  get(@Param("id") id: string) {
    return this.users.get(id);
  }

  @RequirePermissions("users.write")
  @Post()
  create(@CurrentUser("sub") actorId: string, @Body() dto: CreateUserDto) {
    return this.users.create(actorId, dto);
  }

  @RequirePermissions("users.write")
  @Put(":id")
  update(@CurrentUser("sub") actorId: string, @Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(actorId, id, dto);
  }

  @RequirePermissions("users.write")
  @Delete(":id")
  remove(@CurrentUser("sub") actorId: string, @Param("id") id: string) {
    return this.users.remove(actorId, id);
  }
}

