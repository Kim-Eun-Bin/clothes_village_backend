
import {getRepository, getConnection, getManager} from "typeorm";
import { fstat } from "node:fs";

export class ChatController {

    // 채팅방 번호 가져오기
    static getChatRoom = async (req, res) => {
        const {trade_no, user_no1, user_no2} = req.body;
        const entityManager = getManager();

        // 기존에 생성된 채팅방이 있는지 확인
        var selectQuery = "select count(*) as cnt from chat_room where trade_no = " + trade_no + " and user_no1 = " + user_no1 + " and user_no2 = " + user_no2;
        // 쿼리 실행
        var selectResult = await entityManager.query(selectQuery);
        var result = JSON.parse(JSON.stringify(selectResult));
        var cnt = result[0].cnt;
        
        // 기존에 생성된 방이 없으면 생성
        if (cnt == 0) {
            // 생성 쿼리 작성 및 실행
            var insertQuery = "insert into chat_room values (default, " + trade_no +", " + user_no1 + ", " + user_no2 + ")";
            var insertResult = await entityManager.query(insertQuery);
        }

        selectQuery = "select chat_no from chat_room where trade_no = " + trade_no + " and user_no1 = " + user_no1 + " and user_no2 = " + user_no2;
        selectResult = await entityManager.query(selectQuery);
        result = JSON.parse(JSON.stringify(selectResult));
        res.json({chat_no : result[0].chat_no});
    }
    
    // 채팅발송내역 저장하기
    static sendMsg = async (req, res) => {
        const {chat_no, user_no, content} = req.body;
        const entityManager = getManager();

        // 생성 쿼리 작성 및 실행
        var insertQuery = "insert into chat_content values (" + chat_no +", " + user_no + ", '" + content + "', now())";
        const insertResult = await entityManager.query(insertQuery);

        res.json({result : "success"});
    }

    // 체팅리스트 조회하기
    static getChatList = async (req, res) => {
        const {user_no} = req.body;
        const entityManager = getManager();

        // 조회쿼리 작성 및 실행
        var selectQuery = "select a.chat_no "
                        + "     , c.photo "
                        + "     , case when a.user_no1 = " + user_no + " then u2.user_name "
                        + "            else u1.user_name "
                        + "       end as user_name "
                        + "     , case when b.trade_case = '1' then '거래' "
                        + "            else '대여' "
                        + "       end as trade_case "
                        + "     , ifnull((select content from chat_content where chat_no = a.chat_no order by send_dt desc limit 1), '') as last_msg "
                        + "from   chat_room a inner join trade b "
                        + "                           on a.trade_no = b.trade_no "
                        + "                   inner join clothes c "
                        + "                           on b.clothes_no = c.clothes_no "
                        + "                   inner join user u1 "
                        + "                           on a.user_no1 = u1.user_no "
                        + "                   inner join user u2 "
                        + "                           on a.user_no2 = u2.user_no "
                        + "where  (a.user_no1 = " + user_no
                        + "   or   a.user_no2 = " + user_no + ")"
                        + "  and   ifnull((select content from chat_content where chat_no = a.chat_no order by send_dt desc limit 1), '') != '' "
                        + "order by a.chat_no desc";
        console.log(selectQuery);
        const selectResult = await entityManager.query(selectQuery);

        res.send(selectResult);
    }

    // 채팅내용 가져오기
    static getChatMsgList = async (req, res) => {
        const {chat_no} = req.body;
        const entityManager = getManager();

        var selectQuery = "select user_no, content, send_dt "
                        // + "     , case when user_no = " + user_no + " then 'R' else 'L' end as position " 
                        + "from chat_content "
                        + "where chat_no = " + chat_no;

        const selectResult = await entityManager.query(selectQuery);

        res.send(selectResult);
    }
}