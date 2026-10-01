import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { DominantHand } from 'src/common/enum/profile-role.enum';

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn('increment')
    patient_id: number;

    @Column({
        type: 'date',
    })
    birth_date: string;

    @Column({
        type: 'varchar',
        length: 80,
    })
    country: string;

    @Column({
        type: 'varchar',
        length: 80,
    })
    city: string;

    @Column({
        type: 'enum',
        enum: DominantHand,
        enumName: 'dominant_hand_enum',
    })
    dominant_hand: DominantHand;

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

    // Un usuario tiene como máximo un perfil de paciente.
    // onDelete CASCADE: si se borra el usuario, se borra su perfil.
    @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @RelationId((patient: Patient) => patient.user)
    user_id: number;
}