import {Router} from "express";                                                                 /* express를 통한 Router 모듈화 */
import {ImgController} from "../controller/ImgController";                                      /* ImgController Import */
import {UserController} from "../controller/UserController";                                    /* UserController Import */
import {ClothesController} from "../controller/ClothesController";                              /* ClothesController Import */
import {TradeController} from "../controller/TradeController";                                  /* TradeController Import */
import {StyleController} from "../controller/StyleController";                                  /* StyleController Import */
import {ReplyController} from "../controller/ReplyController";                                  /* ReplyController Import */
import {WeatherController} from "../controller/WeatherController";                              /* WeatherController Import */
import {ChatController} from "../controller/ChatController";                                    /* ChatController Import */

/* Router 객체 생성 */
const routes = Router();

/* 이미지 업로드를 위한 multer 객체 생성 */
const multer = require('multer');
const path = require('path');
const upload = multer({
                    storage: multer.diskStorage({
                        destination: function (req, file, cb) {
                            cb(null, 'uploads/');
                        },
                        filename: function (req, file, cb) {
                            cb(null, new Date().valueOf() + path.extname(file.originalname));
                        }  
                    })
                });                                                                             // 파일 업로드 설정

/* Router 객체를 통한 Controller Method 호출 */
/* 공통 */
routes.post('/img/uploadImg', upload.single('photo'), ImgController.uploadImg);                 // 이미지 업로드(수정작업용)

/* 1) user 테이블 관련 Method */
routes.post('/user/checkEmail', UserController.checkEmail);                                     // 이메일 중복 확인
routes.post('/user/checkName', UserController.checkName);                                       // 닉네임 중복 확인
routes.post('/user/userInsert', UserController.addUser);                                        // 회원가입
routes.post('/user/login', UserController.login);                                               // 로그인
routes.post('/user/getUserInfo', UserController.userInfo);                                      // 로그인 정보 가저오기
routes.post('/user/userUpdateLocation', UserController.modifyUserLocation);                     // 고객 위치정보 수정
routes.post('/user/userUpdate', UserController.modifyUser);                                     // 고객 정보 수정

/* 2) clothes 테이블 관련 Method */
routes.post('/clothes/clothesInsert', upload.single('photo'), ClothesController.addClothes);    // 옷 등록
routes.post('/clothes/getClothesList', ClothesController.getClothesList);                       // 옷 조회(List)
routes.post('/clothes/getClothesDetail', ClothesController.getClothesDetail);                   // 옷 조회(Detail)
routes.post('/clothes/clothesUpdate', ClothesController.clothesUpdate);                         // 옷 수정
routes.post('/clothes/clothesDelete', ClothesController.clothesDelete);                         // 옷 삭제

/* 3) trade 테이블 관련 Method */
routes.post('/trade/tradeInsert', TradeController.addTrade);                                    // 거래 등록
routes.post('/trade/getTradeList', TradeController.getTradeList);                               // 거래 조회(List)
routes.post('/trade/getTradeDetail', TradeController.getTradeDetail);                           // 거래 조회(Detail)
routes.post('/trade/tradeUpdate', TradeController.tradeUpdate);                                 // 거래 수정
routes.post('/trade/tradeDelete', TradeController.tradeDelete);                                 // 거래 삭제

/* 4) style 테이블 관련 Method */
routes.post('/style/styleInsert', StyleController.addStyle);                                    // 코디 등록
routes.post('/style/getStyleList', StyleController.getStyleList);                               // 코디 조회(List)
routes.post('/style/getStyleDetail', StyleController.getStyleDetail);                           // 코디 조회(Detail)
routes.post('/style/getStyleDetailImages', StyleController.getStyleDetailImages);               // 코디 조회(Detail - images)
routes.post('/style/styleDelete', StyleController.styleDelete);                                 // 코디 삭제
routes.post('/style/styleSelect', StyleController.styleSelect);                                 // 코디 좋아요 누르기
routes.post('/style/getUserSelectList', StyleController.getUserSelectList);                     // 좋아요한 코디 목록 조회

/* 5) reply 테이블 관련 Method */
routes.post('/reply/replyInsert', ReplyController.replyInsert);                                 // 댓글등록
routes.post('/reply/getReplyList', ReplyController.getReplyList);                               // 댓글조회
routes.post('/reply/replyUpdate', ReplyController.replyUpdate);                                 // 댓글수정
routes.post('/reply/replyDelete', ReplyController.replyDelete);                                 // 댓글삭제

/* 6) OpenWeatherMap API 관련 Method */
routes.post('/weather/currentWeather', WeatherController.currentWeather);                       // 현재 날씨
routes.post('/weather/hourlyWeather', WeatherController.hourlyWeather);                         // 시간별 날씨
routes.post('/weather/dailyWeather', WeatherController.dailyWeather);                           // 일별 날씨

/* 7) Chat 관련 Method */
routes.post('/chat/getChatRoom', ChatController.getChatRoom);                                   // 채팅방 번호 가져오기
routes.post('/chat/sendMsg', ChatController.sendMsg);                                           // 메시지 보내기
routes.post('/chat/getChatList', ChatController.getChatList);                                   // 채팅 리스트
routes.post('/chat/getChatMsgList', ChatController.getChatMsgList);                             // 채팅내

export default routes;