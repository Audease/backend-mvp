import { Role } from "../../utils/enum/role";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('roles')
export class Roles {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('enum', { enum: Role, default: Role.NONE })
    role: Role;

    @Column('text', { nullable: true })
    description: string;

    @CreateDateColumn({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        name: 'created_at',
    })
    created_at: Date;

    @CreateDateColumn({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        name: 'updated_at',
    })
    updated_at: Date;
}