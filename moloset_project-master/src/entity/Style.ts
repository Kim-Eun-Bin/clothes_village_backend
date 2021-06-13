import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class Style {
    @PrimaryGeneratedColumn()
    style_no: number;          // 코디번호

    @Column({length: 100})
    style_name: string;        // 코디 이름

    @Column("text")
    style_content: string;     // 코디 내용

    @Column("text")
    hash_tag: string;          // 해시태그
}