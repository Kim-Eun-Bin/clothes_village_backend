import {Clothes} from "../entity/Clothes";
import {Trade} from "../entity/Trade";
import {getRepository, getConnection, getManager} from "typeorm";
import { fstat } from "node:fs";

export class ClothesController {

    // 옷 등록
    static addClothes = async (req, res) => {
        
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {clothes_category, clothes_name, clothes_memo, owner_no} = body;

        // Entity 객체 생성
        const clothes = new Clothes();

        clothes.clothes_category = clothes_category;        // 옷 구분
        clothes.clothes_name = clothes_name;                // 옷 이름
        clothes.clothes_memo = clothes_memo;                // 옷 메모
        clothes.photo = req.file.path;                      // 사진
        clothes.owner_no = owner_no;                        // 등록자 

        // 처리결과 return
        const result = await getConnection().getRepository(Clothes).save(clothes);
        res.json({result :"success"});
    }

    // 옷 가져오기(List)
    static getClothesList = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {owner_no, clothes_category} = body;

        const result = await getRepository(Clothes)
                                .createQueryBuilder("clothes")
                                .where("clothes.owner_no = :owner_no", 
                                        {
                                            owner_no : owner_no
                                        })
                                .andWhere("clothes_category = case :clothes_category when 'A' then clothes_category else :clothes_category end",
                                        {
                                            clothes_category : clothes_category
                                        }
                                )
                                .orderBy("clothes_no","DESC")
                                .getMany();

        res.send(result);
    }

    // 옷 가져오기(Detail)
    static getClothesDetail = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {owner_no, clothes_no} = body;

        // 고객이 등록한 옷의 상세내용 가져오기
        const result = await getRepository(Clothes)
        .createQueryBuilder("clothes")
        .where("clothes.owner_no = :owner_no", 
                {
                    owner_no : owner_no
                })
        .andWhere("clothes.clothes_no = :clothes_no", 
                {
                    clothes_no : clothes_no
                })
        .getOne();

        res.send(result);
    }

    // 옷 수정하기
    static clothesUpdate = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {clothes_no, clothes_category, clothes_name, clothes_memo, owner_no, photo} = body;
        var resultMsg = '';

        // 거래정보 등록내역 확인하기
        const checkTrade = await getRepository(Trade)
                                .createQueryBuilder("trade")
                                .select("IFNULL(COUNT(*), 0)", "count")
                                .where("trade.clothes_no = :clothes_no", 
                                        {
                                            clothes_no : clothes_no
                                        })
                                .getRawOne();
        
        if (checkTrade.count > 0) {
            resultMsg = "failTradeInfo";
        }

        // 코디 등록내역 확인하기
        if (resultMsg == '') {
            const entityManager = getManager();

            const checkStyle = await entityManager.query("select coalesce(count(*),0) as count from clothes_style where clothes_no = " + clothes_no);
            const parse = JSON.parse(JSON.stringify(checkStyle));
            const cnt = parseInt(parse[0].count);

            if (cnt > 0) {
                resultMsg = "failStyleInfo";
            }
        }

        // 기존정보 가져오기
        if (resultMsg == '') {
            const fileName = await getRepository(Clothes)
                                    .createQueryBuilder("clothes")
                                    .where("clothes.clothes_no = :clothes_no", 
                                                {
                                                    clothes_no : clothes_no
                                                })
                                    .andWhere("clothes.owner_no = :owner_no", 
                                                {
                                                    owner_no : owner_no
                                                })
                                    .getOne();

            // 기존 파일 경로
            var path = fileName.photo;
            console.log(path);

            // 데이터를 삭제하기 전, 업로드된 이미지를 삭제한다.
            if (photo != null) {
                if (path != null && path != ''){
                    const fs = require('fs');
                    fs.unlink(path, function(err){
                        if(err)throw err;
                    });
                }

                path = photo;
            }

            // 데이터 수정
            const result = await getConnection()
                                .createQueryBuilder()
                                .update(Clothes)
                                .set({
                                    clothes_category: clothes_category
                                , clothes_name: clothes_name
                                , clothes_memo: clothes_memo
                                , photo: path
                                })
                                .where("clothes_no = :clothes_no",
                                        {
                                            clothes_no : clothes_no
                                        })
                                .andWhere("owner_no = :owner_no",
                                        {
                                            owner_no : owner_no
                                        })
                                .execute();

            resultMsg = "success";
        }

        res.json({result : resultMsg});
    }

    // 옷 삭제하기
    static clothesDelete = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {clothes_no, owner_no} = body;
        var resultMsg = '';

        // 거래정보 등록내역 확인하기
        const checkTrade = await getRepository(Trade)
                                .createQueryBuilder("trade")
                                .select("IFNULL(COUNT(*), 0)", "count")
                                .where("trade.clothes_no = :clothes_no", 
                                        {
                                            clothes_no : clothes_no
                                        })
                                .getRawOne();
        
        if (checkTrade.count > 0) {
            resultMsg = "failTradeInfo";
        }

        // 코디 등록내역 확인하기
        if (resultMsg == '') {
            const entityManager = getManager();

            const checkStyle = await entityManager.query("select coalesce(count(*),0) as count from clothes_style where clothes_no = " + clothes_no);
            const parse = JSON.parse(JSON.stringify(checkStyle));
            const cnt = parseInt(parse[0].count);

            if (cnt > 0) {
                resultMsg = "failStyleInfo";
            }
        }

        if (resultMsg == '') {
            // 데이터를 삭제하기 전, 업로드된 이미지를 삭제한다.
            const fileName = await getRepository(Clothes)
                                .createQueryBuilder("clothes")
                                .where("clothes.clothes_no = :clothes_no", 
                                            {
                                                clothes_no : clothes_no
                                            })
                                .andWhere("clothes.owner_no = :owner_no", 
                                            {
                                                owner_no : owner_no
                                            })
                                .getOne();
            
            if (fileName.photo != null && fileName.photo != ''){
                const fs = require('fs');
                fs.unlink(fileName.photo, function(err){
                    if(err)throw err;
                });
            }

            // 데이터 삭제
            const result = await getConnection()
                                .createQueryBuilder()
                                .delete()
                                .from(Clothes)
                                .where("clothes_no = :clothes_no",
                                        {
                                            clothes_no : clothes_no
                                        })
                                .andWhere("owner_no = :owner_no",
                                        {
                                            owner_no : owner_no
                                        })
                                .execute();
                        
            resultMsg = "success";
        }
        res.json({result : resultMsg});
    }
}