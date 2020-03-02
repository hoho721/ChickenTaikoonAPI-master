module.exports = {
    // 기본 저장고 수치, 연구로 올라가는 수치
    DEFAULT_MAX_EGG: 30,                    // 기본 알 최대 보유량
    DEFAULT_MAX_CHICKEN: 10,                // 기본 닭 최대 보유량

    // 닭 상태별 금액
    POINT_PER_GRADE_A: 5,                               //POINT
    POINT_PER_GRADE_B: 4,
    POINT_PER_GRADE_C: 3,
    POINT_PER_GRADE_D: 2,
    POINT_PER_GRADE_F: 1,

    // 점수 구간
    SCORE_RANGE_A: 1,                                       // A
    SCORE_RANGE_A_B: 2,                                     // A ~ B
    SCORE_RANGE_A_C: 3,                                     // A ~ C
    SCORE_RANGE_B_C: 4,                                     // B ~ C
    SCORE_RANGE_C_D: 5,                                     // C ~ D
    SCORE_RANGE_D_F: 6,                                     // D ~ F
    SCORE_RANGE_F: 7,                                       // F


    // 닭 등급
    GRADE_NONE: 0,
    GRADE_A: 1,
    GRADE_B: 2,
    GRADE_C: 3,
    GRADE_D: 4,
    GRADE_F: 5,

    // 등급 별 판매 금액
    POINT_GRADE_A: 5,
    POINT_GRADE_B: 4,
    POINT_GRADE_C: 3,
    POINT_GRADE_D: 2,
    POINT_GRADE_F: 0,


    CHICKEN_STATUS_GOOD: 1, // 좋음
    CHICKEN_STATUS_SICK: 2, // 아픔
    CHICKEN_STATUS_DEAD: 3, // 죽음

    // 계란 타입
    EGG_NORMAL: 0,
    EGG_GOLD: 1,
    DEFAULT_GOLD_EGG_PERCENT: 5,                            // 황금 알 낳을 확률 (기본치)

    // 달걀 개당 가격
    POINT_PER_EGG: 33,                                     //GOLD 20 * 30 600
    // 황금알 가격
    POINT_PER_GOLD_EGG: 1000,                               //GOLD
    // 치료할때 사용되는 골드
    POINT_CURE: 100,

    // 테이블에 지정된 기본 수치 (사용하지는 않음)
    HP_DEFAULT: 150,
    DIRTY_DEFAULT: 0,
    LOVELY_DEFAULT: 100,

    // 상태 변경 관련 변수
    STATUS_HP_UP: 0,                       // 밥줄때 hp 증가 수치
    STATUS_LOVELY_UP: 10,                   // 놀아줄때 호감 회복 수치


    STATUS_HP_DOWN: 1,                     // 기본 10분 단위로 1씩 감소
    STATUS_LOVE_DOWN: 2,                   // 기본  단위로 2씩 감소
    STATUS_HP_DOWN_WHEN_SICK: 2,           // 병걸렸을때  단위로 체력 2씩 추가 감소
    STATUS_LOVELY_DOWN_WHEN_SICK: 3,       // 병걸렸을때  단위로 호감도가 3씩 추가 감소
    STATUS_DIRTY_UP: 5,                    // 더러움이 단위로 5씩 증가

    STATUS_DIRTY_RECOVERY_POINT: 10,        // 청소시 회복되는 청결도 수치
    STATUS_HP_UP_BY_CLEANUP: 0,            // 청소시 회복되는 체력 수치
    STATUS_LOVE_UP_BY_CLEANUP: 1,          // 청소시 회복되는 호감도 수치

    STATUS_HP_UP_BY_CURE: 15,               // 치료시 회복 되는 체력
    STATUS_LOVE_UP_BY_CURE: 3,             // 치료시 회복 되는 호감도

    // 병걸릴 확률 더러움 10증가시 질병 걸릴 확률 증가
    DEFAULT_SICK_PERCENT: 0.9,               // 청결도에 따라 병걸릴 확률
    CHICKEN_SICK_INTERVAL: 30,               // 치킨 병 걸리기 주기
    //




    // 닭 별 HP
    CHICKEN_HP_CODE0 : 150,
    CHICKEN_HP_CODE1 : 300,
    CHICKEN_HP_CODE2 : 200,
    CHICKEN_HP_CODE3 : 500,
    CHICKEN_HP_CODE4 : 200,
    CHICKEN_HP_CODE5 : 100,



    // 상태 업데이트 주기
    UPDATE_INTERVAL: 10 * 60,

    // 알낳는 주기
    EGG_INTERVAL: 30 * 60,

    // 오프라인
    OFFLINE_ONECHICKEN_MAX_EGG_COUNT: 3,     // 오프라인시 닭 한마리 최대 달걀생성 개수
    OFFLINE_MAX_EGG_COUNTS: 30,               // 오프라인시 최대 달걀생성 개수
    OFFLINE_EGG_TIME : 60*60,                // 오프라인시 알 낳을 주기 (초)


    // 진화
    CHICKEN_UPGRADE_TIME : 24 * 60 * 60 * 2,      //진화 가능한시간  (2일)
    CHICKEN_UPGRADE_CLEAR : 50 ,//12 * 3,               //고등급 진화 필요한 청소 횟수
    CHICKEN_UPGRADE_PLAY :  50 ,//12 * 3,               //고등급 진화 필요한 놀아주기 횟수
    CHICKEN_UPGRADE_FOOD :  70 ,//12 * 3,               //고등급 진화 필요한 먹이주기 횟수




    // 놀아주기 시간
    CHICKEN_PLAY_TIME : 60,                                          //놀아주기 가능한시간



};