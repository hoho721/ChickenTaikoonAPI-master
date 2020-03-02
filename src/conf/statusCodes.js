module.exports = {
    CODE_SUCCESS: "000",                                                                                                // 성공
    CODE_ERR_DB: "001",                                                                                                 // 디비 에러
    CODE_ERR_PARAMS: "002",                                                                                             // 파라미터 에러
    CODE_ERR_OTHERS: "003",                                                                                             // 기타 에러
    CODE_ERR_WRONG_CLIENT: "004",                                                                                       // 허용되지 않은 클라이언트
    CODE_ERR_INVALID_ACCESS: "005",                                                                                     // 잘못된 접근
    CODE_ERR_DUPLICATE_UID: "006",                                                                                      // 사용자 아이디 중복
    CODE_ERR_DUPLICATE_PHONE: "007",                                                                                    // 사용중인 핸드폰 번호
    CODE_ERR_DUPLICATE_NICK: "008",                                                                                     // 사용중인 닉네임
    CODE_ERR_LOGIN_FAIL_BY_NOT_MEMBER: "009",                                                                           // 회원이 아님
    CODE_ERR_LOGIN_FAIL_BY_NOT_PERMIT: "010",                                                                           // 사용 정지됨
    CODE_ERR_LOGIN_FAIL_BY_WRONG_PW: "011",                                                                             // 패스워드 틀림
    CODE_ERR_WRONG_SESSION_KEY: "012",                                                                                  // 세션키 오류
    CODE_ERR_EMPTY_DATA: "013",                                                                                         // 데이터가 없을 경우

    //사용자알림 에러코드
    CODE_ERR_USER_ALERT: "100",                                                                                         // 사용자 알림 에러메세지

    // 모금 종료
    CODE_DONATION_DONE: "020",                                                                                          // 기부 종료

    //
    CODE_ERR_HAS_LATEST_CONTRACT: "101",                                                                                // 최근 계약이 있을때
    CODE_ERR_CONTRACT_FAILED: "102",                                                                                    // 계약 실패
    CODE_ERR_NOT_ENOUGH_GOLD:   "103",                                                                                  // 골드 또는 포인트 부족
    CODE_ERR_EXCEED_CHICK_COUNT: "104",                                                                                 // 닭 보유 갯수 초과
    CODE_ERR_MAX_LEVEL: "105",                                                                                          // 각종 레벨 최대치
    CODE_ERR_CURE_FAILED: "106",                                                                                        // 치료 실패
    CODE_ERR_EGG_PRODUCT_FAILED: "107",                                                                                 // 알 생산 요청 실패
    CODE_ERR_NOT_ENOUGH_EGG:   "108",                                                                                   // 알 보유량 부족
    CODE_ERR_NOT_ENOUGH_CHICKEN: "109",                                                                                 // 닭 보유량 부족
    CODE_ERR_NOT_FULFILL_CONTRACT: "110",                                                                                 // 계약 조건 성립 하지 않음
    CODE_ERR_NOT_EXIST_CHICKEN: "111",                                                                                  // 실제 닭이 존재 하지않음

    CODE_ERR_NOT_FOUND_NICK:   "112",                                                                                  // 닉네임 못찾음
    CODE_ERR_NOT_FOUND_TICKET:   "113",                                                                                  // 이미 추천함
    CODE_ERR_MY_NICK:   "112",                                                                                  // 자기추천 못함

    //

    CODE_ERR_HISTORY_ADD_FAIL : "500",


    //
    CODE_ERR_EGG_CHICKEN_DIE : "120",                                                                                   // 죽은닭
    CODE_ERR_EGG_TIME : "121",                                                                                          // 생성시간 모자람

    //
    CODE_ERR_EGG_COUNT_MAX : "130",                                                                                          // 달걀 최대치

    //충전소
    CODE_ERR_ALREADY_GET_POINT : "101",                                                                                  // 이미 받은 포인트



    // 취침모드
    CODE_ERR_SLEEP_NOT_DATE : "101",                                                                                    // 오늘 이미 잠
    CODE_ERR_SLEEP_ALEADY : "102",                                                                                      // 이미 자는중


    // 마을
    CODE_ERR_TOWN_HEART_NOT_COUNT : "101",                      // 하트 부족
    CODE_ERR_HEART_NOT_ZERO : "102",                      // 하트 0개 아니라 충전 못함.
    CODE_ERR_HEART : "103",





    // 스탑워치 에러
    CODE_ERR_STOP_POINT_ERROR : "101",                      // 포인트 범위 이탈

    //
    CODE_ERR_NOT_FOUND_MESSAGE : "101",                      // 포인트 범위 이탈


};