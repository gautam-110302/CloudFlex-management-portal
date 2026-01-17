import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  ManyToOne, 
  CreateDateColumn 
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { ProjectUser } from './project-user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  // Relation to the Join Table for User Assignments
  @OneToMany(() => ProjectUser, (pu) => pu.project)
  projectUsers: ProjectUser[];

  // Relation to the Company (Client)
  @ManyToOne(() => Client, (client) => client.projects)
  client: Client;

  @CreateDateColumn()
  created_at: Date;
}