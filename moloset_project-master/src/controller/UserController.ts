import {User} from "../entity/User";
import {getRepository, getConnection, getManager} from "typeorm";
import { fstat } from "node:fs";

export class UserController {

    // 회원가입
    static addUser = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {user_email, user_pwd, user_name, user_gender, user_birth, user_height, user_weight, user_location} = req.body;

        // Entity 객체 생성
        const user = new User();

        user.user_email = user_email;       // 이메일
        user.user_pwd = user_pwd;           // 비밀번호
        user.user_name = user_name;         // 닉네임
        user.user_gender = user_gender;     // 성별
        user.user_birth = user_birth;       // 생년월일
        user.user_height = user_height;     // 키
        user.user_weight = user_weight;     // 몸무게
        user.user_location = user_location; // 위치
        user.user_profile = null;

        // 처리결과 return
        const result = await getConnection().getRepository(User).save(user);
        res.json({user_no:result.user_no});
    }

    // 이메일 중복검사
    static checkEmail = async (req, res) => {
        // Post로 넘어오는 parameter 받기(이메일 받아오기)
        const {user_email} = req.body;

        // 쿼리를 실행했을 때, 결과값이 1이면 중복되는 이메일이 있음을 나타냄
        const check = await getRepository(User)
                          .createQueryBuilder("user")
                          .select("IFNULL(COUNT(*), 0)", "count")
                          .where("user.user_email = :user_email", 
                                    {
                                        user_email : user_email
                                    })
                          .getRawOne();

        if (check.count == 0){
            res.json({result :"success"});
        } else {
            res.json({result :"fail"});
        }
    }

    // 로그인 체크
    static login = async (req, res) => {
        // Post로 넘어오는 parameter 받기(이메일 받아오기)
        const {user_email, user_pwd} = req.body;

        // 쿼리를 실행했을 때, 결과값이 1이면 중복되는 이메일이 있음을 나타냄
        const check = await getRepository(User)
                          .createQueryBuilder("user")
                          .select("IFNULL(COUNT(*), 0)", "count")
                          .where("user.user_email = :user_email", 
                                    {
                                        user_email : user_email
                                    })
                          .andWhere("user.user_pwd = :user_pwd",
                                    {
                                        user_pwd : user_pwd
                                    })
                          .getRawOne();

        if (check.count == 1){
            res.json({result :"success"});
        } else {
            res.json({result :"fail"});
        }
    }

    // 닉네임 중복검사
    static checkName = async (req, res) => {
        // Post로 넘어오는 parameter 받기(닉네임 받아오기)
        const {user_name} = req.body;

        // 쿼리를 실행했을 때, 결과값이 1이면 중복되는 이메일이 있음을 나타냄
        const check = await getRepository(User)
                           .createQueryBuilder("user")
                           .select("IFNULL(COUNT(*), 0)", "count")
                           .where("user.user_name = :user_name", 
                                    {
                                        user_name : user_name
                                    })
                           .getRawOne();

        if (check.count == 0){
            res.json({result :"success"});
        } else {
            res.json({result :"fail"});
        }
    }

    // 로그인 정보 가져오기
    static userInfo = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {user_email} = req.body;

        // 로그인 정보 가져오기
        const result = await getConnection().getRepository(User).findOne({user_email});

        res.send(result);
    }

    // 정보 수정
    static modifyUser = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const body = JSON.parse(JSON.stringify(req.body));
        const {user_email, user_pwd, user_name, user_gender, user_birth, user_height, user_weight, user_profile} = body;
        const entityManager = getManager();

        var query = "select ifnull(user_profile,'') as filePath from user where user_email = '" + user_email + "'";
        const resultQuery = await entityManager.query(query);
        const path = JSON.parse(JSON.stringify(resultQuery));
        const filePath = path[0].filePath;
        var profile = filePath;

        // 기존 프로필 사진이 있으면 해당 파일 삭제 후 진행
        if (user_profile != null) {
            if (filePath != ''){
                const fs = require('fs');
                fs.unlink(filePath, function(err){
                    if(err)throw err;
                });

                profile = user_profile;
            }
        }

        // 정보수정
        const result = await getConnection()
                            .createQueryBuilder()
                            .update(User)
                            .set(
                                    {
                                      user_name: user_name                // 닉네임
                                    , user_pwd : user_pwd                 // 비밀번호
                                    , user_gender: user_gender            // 성별
                                    , user_birth: user_birth              // 생년월일
                                    , user_height: user_height            // 키
                                    , user_weight: user_weight            // 몸무게
                                    , user_profile: user_profile          // 프로필사진 경로
                                    })
                            .where("user_email = :user_email", 
                                {
                                    user_email : user_email
                                })
                            .execute();
        
        // 처리결과 return
        if (result.raw.serverStatus == 34){
            res.json({result :"success"});
        } else {
            res.json({result :"fail"});
        }
    }

    // 위치정보 수정 (앱 실행 및 로그인 시, 해당 쿼리 실행)
    static modifyUserLocation = async (req, res) => {
        // Post로 넘어오는 parameter 받기
        const {user_email, user_location} = req.body;

        // 정보수정
        const result = await getConnection()
                            .createQueryBuilder()
                            .update(User)
                            .set(
                                    {
                                      user_location: user_location                // 위치
                                    })
                            .where("user_email = :user_email", 
                                {
                                    user_email : user_email
                                })
                            .execute();
        
        // 처리결과 return
        if (result.raw.serverStatus == 34){
            res.json({result :"success"});
        } else {
            res.json({result :"fail"});
        }
    }
}