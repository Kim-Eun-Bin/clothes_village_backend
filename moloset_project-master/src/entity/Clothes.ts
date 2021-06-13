import {Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import { User } from "./User";

@Entity()
export class Clothes {
    @PrimaryGeneratedColumn()
    clothes_no: number;            // 옷번호

    @Column({length: 2})
    clothes_category: string;      // 옷 유형

    @Column({length:100})
    clothes_name: string;          // 옷 이름

    @Column("text")
    clothes_memo: string;          // 메모

    @Column({type: "longblob"})
    photo: string;                 // 사진

    @Column()
    owner_no: number;              // user_no
}