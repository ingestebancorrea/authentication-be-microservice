import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('physiotherapists')
export class Physiotherapist {
    @PrimaryGeneratedColumn('increment')
    physiotherapist_id: number;

    @Column({
        type: 'varchar',
        length: 120,
    })
    specialty: string;

    @Column({
        type: 'varchar',
        length: 60,
    })
    license_number: string;

    @Column({
        type: 'varchar',
        length: 160,
        nullable: true,
    })
    institution: string;

    @Column({
        type: 'int',
    })
    years_of_experience: number;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: true,
    })
    phone: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    notes: string;

    // Un usuario tiene como máximo un perfil de fisioterapeuta.
    // onDelete CASCADE: si se borra el usuario, se borra su perfil.
    @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @RelationId((physiotherapist: Physiotherapist) => physiotherapist.user)
    user_id: number;
}