module.exports = {

    versionCode : 100,
    versionName : "1.0.0",


    /////
    STORE_USER_KEY : "CK21932826",
    STORE_USER_ID : "GFN0583",
    STORE_BASE_URL : "https://wapi.gift-n.net",

    //////gift show

    GIFT_STORE_CODE : "REAL0de2c265e7c34b0396b316e472aa14dd",
    GIFT_STORE_TOKEN : "2Oxs9RFQDepp3xSBQ9Y06A==",
    GIFT_STORE_BASE_URL : "https://bizapi.giftishow.com/bizApi",
    GIFT_STORE_ID : "skylsc1004@naver.com",
    GIFT_STORE_PHONE : '01074778038',

    GIFT_TEMPLATE_ID : '202001130048475',
    GIFT_BANNER_ID : '202001130048589',

////////////



    JOIN_TYPE_NORMAL: 0,
    JOIN_TYPE_GOOGLE: 1,

    DEFAULT_GOLD: 5000,                     // 회원가입 시 기본 지급 골드

    // 계약 완수, 실패
    CONTRACT_FAILED:0,
    CONTRACT_SUCCESS:1,


    // 포인트 히스토리 타입
    POINT_TYPE_BUY_ITEM: -2,                            // 아이템 구매
    POINT_TYPE_CONTRACT: -1,                            // 계약금
    POINT_TYPE_USE: 0,                                  // 사용
    POINT_TYPE_OBTAIN: 1,                               // 획득
    POINT_TYPE_SELL: 2,                                 // 판매로 획득
    POINT_TYPE_CONTRACT_CANCEL: 3,                      // 계약 취소, 성공 계약금 환급
    POINT_TYPE_BUG: 4,                                  // 벌래 클릭 획득
    POINT_TYPE_GOLD_EGG: 5,                             // 황금알 획득
    POINT_TYPE_RULET_GET: 6,                            // 룰렛 획득
    POINT_TYPE_POINT_SHOP: 7,                           // 포인트 상점 획득
    POINT_TYPE_EXCHANGE: 8,                             // 환전 -
    POINT_TYPE_PUSH : 9,                               // 추천인 금액 지급
    POINT_TYPE_COIN_SHOP : 10,                               // 충전소 적립
    POINT_TYPE_ETC : 11,                               // 기타 적립
    POINT_TYPE_MISSION : 12,                               // 미션 적립
    POINT_TYPE_CHICKEN_STORE_BUY : 13,                               // 치킨상점 상품 구매
    POINT_TYPE_CHICKEN_STORE_BUY_CANCEL : 14,                               // 치킨상점 상품 환불
    POINT_TYPE_SLEEP_GOLD : 15,                               // 취침보상
    POINT_TYPE_EVENT_CHRISMAS : 16,                               // 이벤트 금액 (크리스마스선물)
    POINT_TYPE_MESSAGE : 17,                               // 메시지
    POINT_TYPE_BUY_ITEM: 18,                            // 길드 가입



    /// 하트 히스토리 타입
    HEART_TYPE_TIME : 101,                               // 시간지나서 획득
    HEART_TYPE_MINI_GAME : 102,                               // 마을 미니게임에 사용
    HEART_TYPE_REWORD : 103,                               // 리워드로 획득


    //추천인
    MAX_SLEEP_GOLD : 18000,                         // 자동 종료 취침보상
    //추천인
    POINT_GOLD : 20000,                         // 추천인 금액


    // 테이블에 아래와 같이 기본 설정 되어있음
    ITEM_TYPE_CHICK: 0,                                     // 병아리 아이템 타입
    ITEM_CHICK_DEFAULT_GRADE: 0,                            //  기본 등급 (병아리)
    ITEM_CHICK_DEFAULT_NAME: '병아리',


    //
    CLEAN_REUSE_TIME : 5,                                     //청소 재사용 시간
    FOOD_REUSE_TIME  : 20,                                    //먹이주기 재사용 시간


    // 치킨
    REASON_CHICKEN_SELL : 1,                                // 치킨 판매
    REASON_CHICKEN_DELIVERY : 2,                            // 치킨 납품
    REASON_CHICKEN_DIE : 3,                                 // 치킨 죽음




    //미션

    DAILY_MISSION_TYPE : 0,                                 //일일 미션
    WEEKLY_MISSION_TYPE : 1,                                //주간 미션
    ACHIEVEMENTS_MISSION_TYPE : 2,                          //업적 미션

    //미션 타입
    MISSION_DAILY_CHECK : 0,                                 //출석체크

    MISSION_FOOD_COUNT : 1,                                 //먹이준횟수
    MISSION_EGG_SELL_COUNT : 2,                             //달걀 판매 횟수
    MISSION_PLANT_COUNT : 3,                                //잡초 뽑은 횟수
    MISSION_BUG_COUNT : 4,                                  //벌래 잡은 횟수
    MISSION_CLEAN_COUNT : 5,                                //청소 횟수
    MISSION_PLAY_COUNT : 6,                                 //놀아준 횟수
    MISSION_CLOUD_SHOWER_COUNT : 7,                         //먹구름 터치하여 소나기 내린 횟수
    MISSION_GOLDEN_EGG_COUNT : 8,                           //황금알 깐 횟수
    MISSION_SELL_CHICKEN_COUNT : 9,                         //닭 판매(납품) 횟수
    MISSION_CHICKEN_UPGRADE_COUNT : 10,                      //닭 진화 횟수
    MISSION_SHOP_COUNT : 11,                                //충전소 이용 횟수
    MISSION_WEEKLY_CHECK : 12,                                 //주간 출석 체크
    MISSION_A_RANK_CHICKEN : 13,                                 //일일 A급 진화
    MISSION_B_RANK_CHICKEN : 14,                                 //일일 B급 진화
    MISSION_C_RANK_CHICKEN: 15,                                 //일일 C급 진화
    MISSION_D_RANK_CHICKEN : 16,                                 //일일 D급 진화
    MISSION_F_RANK_CHICKEN : 17,                                 //일일 F급 진화
    MISSION_GAME_FRIED_CHICKEN : 18,                                 //닭튀기기 횟수
    MISSION_GAME_COLOR_CHICKEN : 19,                                 //분류 횟수
    MISSION_GAME_FLY_CHICKEN : 20,                                 //가출 횟수




/// 미션 업적
    MISSION_ACHIEVEMENTS_FOOD :     501,                                // 먹이주기 횟수
    MISSION_ACHIEVEMENTS_EGG_SELL : 502,                                // 달걀 판매
    MISSION_ACHIEVEMENTS_PLANT :    503,                                // 잡초 뽑기
    MISSION_ACHIEVEMENTS_BUG :      504,                                // 벌래
    MISSION_ACHIEVEMENTS_CLEAN :    505,                                // 청소
    MISSION_ACHIEVEMENTS_PLAY :     506,                                // 놀아주기
    MISSION_ACHIEVEMENTS_CLOUD :    507,                                // 먹구름
    MISSION_ACHIEVEMENTS_CHICKEN_SELL :         508,                    // 닭 팔기 (납품)
    MISSION_ACHIEVEMENTS_CONTRACT_COMPLETE :    509,                    // 계약 완수
    MISSION_ACHIEVEMENTS_CONTRACT_START    :    510,                    // 계약 하기
    MISSION_ACHIEVEMENTS_HOUSE_LV    :          511,                    // 집 레벨
    MISSION_ACHIEVEMENTS_CHICK_COOP_LV    :     512,                    // 닭장 레벨
    MISSION_ACHIEVEMENTS_WARE_LV    :           513,                    // 창고 레벨
    MISSION_ACHIEVEMENTS_ARANK    :         514,                    // Arank 진화
    MISSION_ACHIEVEMENTS_BRANK    :         515,                    // Brank 진화
    MISSION_ACHIEVEMENTS_CRANK    :         516,                    // Crank 진화
    MISSION_ACHIEVEMENTS_DRANK    :         517,                    // Drank 진화
    MISSION_ACHIEVEMENTS_FRANK    :         518,                    // Frank 진화
    MISSION_ACHIEVEMENTS_ATYPE    :         519,                    // Atype 진화
    MISSION_ACHIEVEMENTS_BTYPE    :         520,                    // Btype 진화
    MISSION_ACHIEVEMENTS_CTYPE    :         521,                    // Ctype 진화
    MISSION_ACHIEVEMENTS_DTYPE    :         522,                    // Dtype 진화
    MISSION_ACHIEVEMENTS_ETYPE    :         523,                    // Etype 진화
    MISSION_FIVE_TYPE_ARANK       :         524,                    // 5종 a랭크
    MISSION_FIVE_TYPE_BRANK       :         525,                    // 5종 b랭크
    MISSION_FIVE_TYPE_CRANK       :         526,                    // 5종 c랭크
    MISSION_FIVE_TYPE_DRANK       :         527,                    // 5종 d랭크
    MISSION_FIVE_TYPE_FRANK       :         528,                    // 5종 f랭크





    // 마을 관련
    MAX_HEART_COUNT : 3,                                            //최대 하트 개수
    HEART_GET_TIME : 30*60,                                                 //하트 차는 시간

    // 랭킹 관련
    RANK_USER_POINT : 0,                    // 포인트 랭크
    RANK_USER_GOLD : 1,                     // 골드 랭크
    RANK_CHICKEN_UPGRADE : 2,               // 치킨 진화 수
    RANK_A_RANK_CHICKEN : 3,                // A랭크 진화 수
    RANK_CHICKEN_SELL : 4,                  // 치킨 판매 수
    RANK_GOLD_EGG : 5,                      // 황금알 깐 횟수
    RANK_EGG_SELL : 6,                      // 달걀 판매 수
    RANK_BUG : 7,                           // 벌래 잡은 수
    RANK_PLANT : 8,                         // 잡초 뽑은 수
    RANK_CLEAN : 9,                         // 청소 횟수
    RANK_PLAY_CHICKEN : 10,                 // 놀아준 횟수

    RANK_DAY : 0,           // 일간
    RANK_WEEK : 1,          // 주간
    RANK_ALL : 2,           // 누적

    // 길드 유저등급
    TOWN_GUILD_MASTER : 3,
    TOWN_GUILD_SUB_MASTER : 2,
    TOWN_GUILD_NORMAL : 1,

    // 마을 로그관련
    TOWN_LOG_CREATE  : 1,          // 마을 생성 로그
    TOWN_LOG_SIGN    : 2,          // 마을 가입/추방/탈퇴 관련
    TOWN_LOG_SETTING   : 3,          // 마을 설정 변경
    TOWN_LOG_MASTER   : 4,          // 이장 / 부이장 위임 / 해임 관련




};