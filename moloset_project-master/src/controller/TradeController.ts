import {Trade} from "../entity/Trade";
import {Brackets, getConnection, getManager} from "typeorm";
import {createQueryBuilder} from "typeorm";
import {getRepository} from "typeorm";

export class TradeController {

    // 거래 등록
    static addTrade = async (req, res) => {

        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {clothes_no, trade_name, trade_content, trade_price, trade_case, trade_area_name, trade_area} = body;

        // Entity 객체 생성
        const trade = new Trade();

        trade.clothes_no = clothes_no;               // 옷 번호
        trade.trade_name = trade_name;               // 거래글 제목
        trade.trade_content = trade_content;         // 거래글 내용
        trade.trade_price = trade_price;             // 거래금액
        trade.trade_case = trade_case;               // 거래구분
        trade.trade_area_name = trade_area_name;     // 거래장소
        trade.trade_area = trade_area;               // 거래장소(위도,경도)
        
        // 처리결과 return
        const result = await getConnection().getRepository(Trade).save(trade);
        res.json({result :"success"});
    }

    // 거래조회(리스트)
    static getTradeList = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {clothes_category, height, h_check, weight, w_check, user_no} = body;
        const entityManager = getManager();

        // body를 통해 넘어온 parameter는 전부 String이기 때문에, parseInt 메소드를 통해 정수형으로 치환해준다.
        var maxHeight = parseInt(height) + 5;
        var minHeight = parseInt(height) - 5;
        var maxWeight = parseInt(weight) + 5;
        var minWeight = parseInt(weight) - 5;

        // 단순 테이블 조회쿼리의 경우, getRepository를 통해 테이블을 명시하여 조회하였으나, join이 많은 테이블의 경우 쿼리를 작성하여 실행하는 방법으로 작성하였음
        // 쿼리 작성
        var query = "select a.trade_no, a.trade_name, a.trade_content, a.trade_price"
                  + "     , case a.trade_case when '1' then '중고거래' when '2' then '대여' else '거래완료' end as trade_case "
                  + "     , b.photo "
                  + "from   trade a inner join clothes b "
                  + "                       on a.clothes_no = b.clothes_no "
                  + "               inner join user c "
                  + "                       on b.owner_no = c.user_no "
                  + "where  b.clothes_category in (" + clothes_category + ")";
        
        // 키 검색조건 체크
        if (h_check != 'Y'){
            query = query + "  and c.user_height between " + minHeight + " and " + maxHeight;
        }

        // 몸무게 검색조건 체크
        if (w_check != 'Y'){
            query = query + "  and c.user_weight between " + minWeight + " and " + maxWeight;
        }

        // 내 거래 체크
        if (!(user_no == null || user_no == 0)) {
            query = query + "  and c.user_no = " + user_no + " ";
        } else {
            query = query + "  and a.trade_case != '3' ";
        }

        // 역순정렬
        query = query + " order by a.trade_no desc ";

        // 작성된 쿼리 확인
        console.log(query);

        // 쿼리 실행
        const result = await entityManager.query(query);

        res.send(result);
    }

    // 거래조회(상세)
    static getTradeDetail = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {trade_no} = body;
        const entityManager = getManager();

        // 단순 테이블 조회쿼리의 경우, getRepository를 통해 테이블을 명시하여 조회하였으나, join이 많은 테이블의 경우 쿼리를 작성하여 실행하는 방법으로 작성하였음
        // 쿼리 작성
        var query = "select a.trade_no, a.trade_name, a.trade_content, a.trade_price"
                  + "     , case a.trade_case when '1' then '중고거래' when '2' then '대여' else '거래완료' end as trade_case "
                  + "     , a.trade_area, a.trade_area_name"
                  + "     , b.photo, c.user_no, c.user_name, c.user_profile "
                  + "from   trade a inner join clothes b "
                  + "                       on a.clothes_no = b.clothes_no "
                  + "               inner join user c "
                  + "                       on b.owner_no = c.user_no "
                  + "where  a.trade_no in (" + trade_no + ")";

        // 작성된 쿼리 확인
        // console.log(query);

        // 쿼리 실행
        const result = await entityManager.query(query);
        res.send(result[0]);
    }

    // 거래수정
    static tradeUpdate = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {trade_no, clothes_no, trade_name, trade_content, trade_price, trade_case, trade_area_name, trade_area} = body;

        // 데이터 수정
        const result = await getConnection()
                            .createQueryBuilder()
                            .update(Trade)
                            .set({
                            //     clothes_no: clothes_no
                            //   , trade_name: trade_name
                            //   , trade_content: trade_content
                            //   , trade_price: trade_price
                                   trade_case: trade_case
                            //   , trade_area_name: trade_area_name
                            //   , trade_area: trade_area
                            })
                            .where("trade_no = :trade_no",
                                    {
                                        trade_no : trade_no
                                    })
                            .execute();

        res.json({result :"success"})
    }

    // 거래삭제
    static tradeDelete = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {trade_no} = body;

        const result = await getConnection()
                            .createQueryBuilder()
                            .delete()
                            .from(Trade)
                            .where("trade_no = :trade_no",
                                    {
                                        trade_no : trade_no
                                    })
                            .execute();

        res.json({result :"success"})   
    }
}