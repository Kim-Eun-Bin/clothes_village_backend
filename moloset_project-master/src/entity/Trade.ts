import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class Trade {
    @PrimaryGeneratedColumn()
    trade_no: number;           // 거래번호

    @Column()
    clothes_no: number;         // 옷 번호

    @Column({length:100})
    trade_name: string;         // 거래글 제목

    @Column("text")
    trade_content: string;      // 거래글 내용

    @Column()
    trade_price: number;        // 가격

    @Column()
    trade_case: number;         // 거래구분 - 1:중고거래, 2:대여

    @Column({length:100})
    trade_area_name: string     // 거래장소

    @Column("text")
    trade_area: String          // 거래장소(위도, 경도)
}