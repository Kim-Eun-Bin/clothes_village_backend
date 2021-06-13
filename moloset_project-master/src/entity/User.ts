import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_no: number;            // 고객번호

    @Column({length: 100})
    user_email: string;         // 이메일

    @Column({length:20})
    user_pwd: string;           // 비밀번호

    @Column({length:20})
    user_name: string;          // 이름

    @Column({length:6})
    user_gender: string;        // 성별

    @Column()
    user_birth: number;         // 생년월일

    @Column()
    user_height: number;        // 키

    @Column()
    user_weight: number;        // 몸무게

    @Column({length:100})
    user_location: string;      // 위치

    @Column("text")
    user_profile: string;        // 프로필사진
}