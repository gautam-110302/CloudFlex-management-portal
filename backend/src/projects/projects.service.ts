import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectUser } from './entities/project-user.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async hasManagerialAccess(projectId: string, user: any): Promise<boolean> {
    if (user.role === 'admin') return true;

    const assignment = await this.projectUserRepository.findOne({
      where: { 
        project: { id: projectId }, 
        user: { id: user.userId }, 
        role: 'owner' 
      },
    });
    return !!assignment;
  }

  async create(createProjectDto: CreateProjectDto, user: any) {
    const project = this.projectRepository.create({
      ...createProjectDto,
      client: { id: user.clientId },
    });
    return await this.projectRepository.save(project);
  }

  async findAll(user: any) {
    return await this.projectRepository.find({
      where: { client: { id: user.clientId } },
      relations: ['projectUsers', 'projectUsers.user'],
    });
  }

  async findOne(id: string, user: any) {
    const project = await this.projectRepository.findOne({
      where: { id, client: { id: user.clientId } },
      relations: ['projectUsers', 'projectUsers.user'],
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findProjectUsers(projectId: string, user: any) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId, client: { id: user.clientId } }
    });
    if (!project) throw new NotFoundException('Project not found');

    return await this.projectUserRepository.find({
      where: { project: { id: projectId } },
      relations: ['user'],
    });
  }

  async update(id: string, updateProjectDto: any, user: any) {
    if (!(await this.hasManagerialAccess(id, user))) {
      throw new ForbiddenException('Access denied');
    }
    await this.projectRepository.update(id, updateProjectDto);
    return this.findOne(id, user);
  }

  async remove(id: string, user: any) {
    if (!(await this.hasManagerialAccess(id, user))) {
      throw new ForbiddenException('Access denied');
    }
    const project = await this.findOne(id, user);
    return await this.projectRepository.remove(project);
  }

  async assignUser(projectId: string, targetUserId: string, role: string, requester: any) {
    if (!(await this.hasManagerialAccess(projectId, requester))) {
      throw new ForbiddenException('Access denied');
    }
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException('User not found');

    const assignment = this.projectUserRepository.create({
      project: { id: projectId },
      user: targetUser,
      role,
    });
    return this.projectUserRepository.save(assignment);
  }

  async updateProjectUserRole(projectId: string, targetUserId: string, role: string, requester: any) {
    if (!(await this.hasManagerialAccess(projectId, requester))) {
      throw new ForbiddenException('Access denied');
    }
    const assignment = await this.projectUserRepository.findOne({
      where: { project: { id: projectId }, user: { id: targetUserId } }
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    assignment.role = role;
    return this.projectUserRepository.save(assignment);
  }

  async removeProjectUser(projectId: string, targetUserId: string, requester: any) {
    if (!(await this.hasManagerialAccess(projectId, requester))) {
      throw new ForbiddenException('Access denied');
    }
    const assignment = await this.projectUserRepository.findOne({
      where: { project: { id: projectId }, user: { id: targetUserId } }
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.projectUserRepository.remove(assignment);
  }
}