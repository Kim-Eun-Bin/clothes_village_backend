import {Style} from "../entity/Style";
import {Brackets, getConnection, getManager} from "typeorm";
import {createQueryBuilder} from "typeorm";
import {getRepository} from "typeorm";

export class StyleController {

    // 코디 등록
    static addStyle = async (req, res) => {

        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {style_name, style_content, hash_tag, clothes_no} = body;
        const entityManager = getManager();

        // Entity 객체 생성
        const style = new Style();

        style.style_name = style_name;           // 코디 이름
        style.style_content = style_content;     // 코디 내용
        style.hash_tag = hash_tag;               // 해시 태그
        
        // 처리결과 return
        const result = await getConnection().getRepository(Style).save(style);

        var styleNo = result.style_no;
        var splitClothesNo = clothes_no.split(",");

        for (var i = 0; i < splitClothesNo.length; i++){
            const excuetQuery = await entityManager.query("insert into clothes_style values(" + styleNo + ", " + splitClothesNo[i] + ")");
        }

        res.json({result :"success"});
    }

    // 코디 조회(List)
    static getStyleList = async (req, res) => {

        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {user_no, search_div, search_text} = body;
        const entityManager = getManager();

        // 쿼리작성
        var query = "select d.user_profile, d.user_name, a.style_no, a.style_name, a.style_content, max(c.photo) as photo "
                  + "     , case when (select count(*) from user_style where style_no = a.style_no and user_no = " + user_no + ") > 0 "
                  + "            then 'Y' else '' end as goodCheck "
                  + "from   style a inner join clothes_style b "
                  + "                       on a.style_no = b.style_no "
                  + "               inner join clothes c "
                  + "                       on b.clothes_no = c.clothes_no "
                  + "               inner join user d "
                  + "                       on c.owner_no = d.user_no "
                  + "where  1=1"

        if (search_div == '1') {
            query = query + "  and  d.user_no = " + user_no
        } else {
            // if (user_gender != null || user_gender != ''){
            //     query = query
            //           + "  and  d.user_gender = '" + user_gender + "'"
            // }
        }

        if (search_text != '' && search_text != null){
            // 조회조건
            var search_case = search_text.substring(0,1);

            if (search_case == '@'){
            // @ 이름 검색
                query = query + "  and d.user_name = '" + search_text.replace(search_case,'') + "' ";
            } else if (search_case == '#') {
            // # 해시태그 검색
                query = query + "  and a.hash_tag like '%" + search_text.replace(search_case,'') + "%' ";
            } else {
            // 그 외 제목 검색
                query = query + "  and a.style_name like '%" + search_text + "%' ";
            }
        }

        query = query + " group by d.user_profile, d.user_name, a.style_no, a.style_name, a.style_content";
        query = query + " order by a.style_no desc";

        // 실행 쿼리 체크
        console.log(query);

        // 쿼리 실행
        const result = await entityManager.query(query);

        // 결과 return
        res.send(result);
    }

    // 코디 조회(Detail)
    static getStyleDetail = async (req, res) => {

        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {style_no, user_no} = body;
        const entityManager = getManager();

        var query = "";

        // 코디 내용 가져오기
        query = "select a.style_no, a.style_name, a.style_content "
              + "     , case when (select count(*) from user_style where style_no = " + style_no + " and user_no = " + user_no + ") > 0 "
              + "            then 'Y' else '' end as goodCheck "
              + "     , d.user_no, d.user_name, d.user_profile, a.hash_tag "
              + "from   style a inner join clothes_style b "
              + "                       on a.style_no = b.style_no "
              + "               inner join clothes c "
              + "                       on b.clothes_no = c.clothes_no "
              + "               inner join user d "
              + "                       on c.owner_no = d.user_no "
              + "where  a.style_no = " + style_no;
        
        const result = await entityManager.query(query);
        
        // 해시태그 문자열 배열로 split 처리하기
        var hash = result[0].hash_tag.split('|');
        result[0].hash_tag = hash;
        res.send(result[0]);
    }

    // 코디 조회(Detail - image)
    static getStyleDetailImages = async (req, res) => {

        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {style_no, user_no} = body;
        const entityManager = getManager();

        var query = "";

        query = "select c.photo "
              + "from   style a inner join clothes_style b "
              + "                       on a.style_no = b.style_no "
              + "               inner join clothes c "
              + "                       on b.clothes_no = c.clothes_no "
              + "where  a.style_no = " + style_no;

        const result = await entityManager.query(query);
        const parse = JSON.parse(JSON.stringify(result));
        const images = new Array();

        for (var i = 0; i < parse.length; i++){
            images[i] = parse[i].photo;
        }

        res.send(images);
    }

    // 코디 삭제
    static styleDelete = async (req, res) => {

        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {style_no} = body;
        const entityManager = getManager();

        // clothes_style 데이터 삭제
        const relationDelete = await entityManager.query("delete from clothes_style where style_no = " + style_no);

        // 삭제
        const result = await getConnection()
                            .createQueryBuilder()
                            .delete()
                            .from(Style)
                            .where("style_no = :style_no",
                                    {
                                        style_no : style_no
                                    })
                            .execute();

        res.json({result : "success"});
    }

    // 코디 좋아요 누르기
    static styleSelect = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {style_no, user_no, goodCheck} = body;
        const entityManager = getManager();

        var query = '';
        var resultFlag = '';

        // console.log(goodCheck);

        // 좋아요를 누른 상태(Y) -> 좋아요 취소 처리
        // 그 외 -> 좋아요 처리
        if (goodCheck == 'Y'){
            query = "delete from user_style where  style_no = " + style_no + " and user_no = " + user_no;
            resultFlag = 'N';
        } else {
            query = "insert into user_style values (" + style_no + ", " + user_no +", now())";
            resultFlag = 'Y';
        }

        // 쿼리 실행
        const result = entityManager.query(query);

        // 결과 Return -> Y : 좋아요 완료 / N : 좋아요 취소
        res.json({result : resultFlag});
    }

    // 좋아요 누른 코디 목록 가져오기
    static getUserSelectList = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {user_no} = body;
        const entityManager = getManager();

        var query = '';

        query = "select a.style_no, b.style_name, b.style_content, max(d.photo) as photo "
              + "     , e.user_profile, e.user_name "
              + "     , case when (select count(*) from user_style where style_no = a.style_no and user_no = " + user_no + ") > 0 "
              + "            then 'Y' else '' end as goodCheck "
              + "     , a.check_date "
              + "from   user_style a inner join style b "
              + "                            on a.style_no = b.style_no "
              + "                    inner join clothes_style c "
              + "                            on b.style_no = c.style_no"
              + "                    inner join clothes d "
              + "                            on c.clothes_no = d.clothes_no "
              + "                    inner join user e "
              + "                            on a.user_no = e.user_no "
              + "where  a.user_no = " + user_no + " "
              + "group by a.style_no, b.style_name, b.style_content, e.user_profile, e.user_name, a.check_date "
              + "order by a.style_no desc";

        // console.log(query);
        const result = await entityManager.query(query);

        res.send(result);
    }
}