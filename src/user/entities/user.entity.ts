import { Role } from "src/role/entities/role-entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne} from "typeorm";

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
    @Column({
        type: 'int', 
    })
    role: number; 

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.username = this.username.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }
}