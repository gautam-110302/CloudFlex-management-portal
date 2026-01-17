import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Req() req: any) {
    return this.projectsService.create(createProjectDto, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.projectsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.projectsService.findOne(id, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: any, @Req() req: any) {
    return this.projectsService.update(id, updateData, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.projectsService.remove(id, req.user);
  }

  @Post(':id/users')
  assignUser(
    @Param('id') id: string,
    @Body() body: { user_id: string; role: string },
    @Req() req: any,
  ) {
    return this.projectsService.assignUser(id, body.user_id, body.role, req.user);
  }

  @Get(':id/users')
  findProjectUsers(@Param('id') id: string, @Req() req: any) {
    return this.projectsService.findProjectUsers(id, req.user);
  }

  @Put(':id/users/:userId')
  updateProjectUser(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
    @Req() req: any
  ) {
    return this.projectsService.updateProjectUserRole(projectId, userId, role, req.user);
  }

  @Delete(':id/users/:userId')
  removeProjectUser(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
    @Req() req: any
  ) {
    return this.projectsService.removeProjectUser(projectId, userId, req.user);
  }
}