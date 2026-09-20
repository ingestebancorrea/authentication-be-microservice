import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Entity('auth_types')
export class AuthType {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        type: 'varchar',
        unique: true
    })
    name: string;

    @Column({
        type: 'varchar'
    })
    alias: string;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column({
        type: 'bool',
        default: true
    })
    is_active: boolean;

    // Relación de muchos a muchos con la entidad User
    @ManyToMany(() => User, (user) => user.authTypes)
    users: User[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.alias = this.alias.toUpperCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }
}