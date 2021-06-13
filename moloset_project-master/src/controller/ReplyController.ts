import {createQueryBuilder, getConnection, getManager} from "typeorm";
import {getRepository} from "typeorm";

export class ReplyController {

    // 댓글등록 
    static replyInsert = async (req, res) => {
        
        // Post로 넘어오는 parameter 받기
        const {style_no, user_no, reply_content} = req.body;
        const entityManager = getManager();

        var insertQuery = "insert into reply values (default, " + style_no + ", " + user_no + ", '" + reply_content + "')";
        const insertResult = await entityManager.query(insertQuery);

        var query = "select a.reply_no, b.user_profile, b.user_no, b.user_name, a.reply_content "
                  + "from   reply a inner join user b "
                  + "                       on a.user_no = b.user_no "
                  + "where  a.style_no = " + style_no
                  + "  and  a.user_no = " + user_no + " "
                  + "order by a.reply_no desc "
                  + "limit 1";

        const result = await entityManager.query(query);

        // 결과 return
        res.send(result[0]);
    }

    // 댓글조회
    static getReplyList = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {style_no} = req.body;

        // 등록된 데이터 조회
        const entityManager = getManager();

        var query = "select a.reply_no, b.user_profile, b.user_no, b.user_name, a.reply_content "
                  + "from   reply a inner join user b "
                  + "                       on a.user_no = b.user_no "
                  + "where  a.style_no = " + style_no + " "
                  + "order by a.reply_no desc ";

        const result = await entityManager.query(query);
        // var list = "";
        // var cnt = Object.keys(result).length;

        // for (var i = 0 ; i < cnt ; i++){
        //     if (i == 0){
        //         list = JSON.stringify(result[i]);
        //     } else {
        //         list = list + ', ' + JSON.stringify(result[i]);
        //     }
        // }
        // console.log(list);

        // 결과 return
        res.send(result);
    }

    // 댓글수정
    static replyUpdate = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {reply_no, style_no, user_no, reply_content} = req.body;
        const entityManager = getManager();
        var resultMsg = "";

        // 데이터 수정
        var updateQuery = "update reply set reply_content = '" + reply_content + "' where reply_no = " + reply_no + " and style_no = " + style_no + " and user_no = " + user_no;
        const updateResult = await entityManager.query(updateQuery);

        var query = "select a.reply_no, b.user_profile, b.user_no, b.user_name, a.reply_content "
                  + "from   reply a inner join user b "
                  + "                       on a.user_no = b.user_no "
                  + "where  a.reply_no = " + reply_no;

        const result = await entityManager.query(query);

        // 결과 return
        res.send(result[0]);
    }

    // 댓글삭제
    static replyDelete = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {reply_no, style_no, user_no} = req.body;
        const entityManager = getManager();
        var resultMsg = "";

        // 데이터 삭제
        var query = "delete from reply where reply_no = " + reply_no;
        const result = await entityManager.query(query);
        resultMsg = "success";

        res.json({result : resultMsg});
    }
}