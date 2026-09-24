import { Role } from "src/role/entities/role-entity";
import { AuthType } from "src/auth-type/entities/auth-type.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne, ManyToMany, JoinTable, ManyToOne, RelationId } from "typeorm";

@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column( {
        type:'varchar',
        unique: true
    })
    username: string;

    @Column({
        type:'varchar',
        select: false,
        nullable: true
    })
    password: string;

    @Column({
        type:'varchar',
    })
    full_name: string;

    @Column({
        type:'varchar',
        nullable: true
    })
    sub: string;

    @Column({
        type:'varchar',
        nullable: true
    })
    image_url: string;

    @Column( {
        type:'bool',
        default: true
    })
    is_active: boolean;

    // Relación de uno a uno con la entidad Rol
    // Relación de muchos a uno con la entidad Rol (FK users.role -> roles.id)
    @ManyToOne(() => Role, { nullable: false })
    @JoinColumn({ name: 'role' })
    authRole: Role;

    // Expone el id del rol como número en las respuestas
    @RelationId((user: User) => user.authRole)
    role: number; 

    // Relación de muchos a muchos con la entidad AuthType
    @ManyToMany(() => AuthType, (authType) => authType.users)
    @JoinTable({ name: 'users_auth_types' })
    authTypes: AuthType[]; 

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.username = this.username.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }
}