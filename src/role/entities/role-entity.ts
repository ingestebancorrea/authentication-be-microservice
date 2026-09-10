import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column( {
        type:'varchar',
        unique: true
    })
    name: string;

    @Column({
        type:'varchar'
    })
    alias: string;

    @Column({
        type:'text',
        nullable:true
    })
    description: string;

    @Column( {
        type:'bool',
        default: true
    })
    is_active: boolean;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.alias = this.alias.toUpperCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }
}