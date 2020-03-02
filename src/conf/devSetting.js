module.exports = {
    // 연구
    DEV_TYPE_INTERVAL: 1,                   // 호감도, 체력, 청결도 수치 감소 시간 간격 늘림
    DEV_TYPE_FOOD: 2,                       // 먹이 줬을때 hp 회복 수치
    DEV_TYPE_HP: 3,                         // HP 감소량 감소
    DEV_TYPE_GRADE: 4,                      // 등급업 확률
    DEV_TYPE_GOLD_EGG: 5,                   // 황금알 확률
    DEV_TYPE_MAX_CHICK: 6,                  // 총 닭 보유 갯수
    DEV_TYPE_DELAY_EGG: 7,                  // 알 낳는 딜레이 감소

    DEV_INC_PER_INTERVAL: 1 * 60,            // 1분
    DEV_INC_PER_FOOD:  1,                   // 밥줄때 hp 회복 수치 5증가
    DEV_INC_PER_HP_DEC: 100,                  // 감소 딜레이.
    DEV_INC_PER_GRADE: 1,                   // 등급업 확률 5퍼센트 증가
    DEV_INC_PER_GOLD_EGG: 5,                // 황금알 확률 5퍼센트 증가

    DEV_INC_PER_EGG_DELAY: 5 * 60,          // 알 낳는 시간 레벨당 5분 감소
    DEV_INC_PER_CHICK: 1,                   // 연구로 올라가는 닭 보유량 수치

    DEV_MAX_LEVEL: 3,                       // 연구 최대 레벨
    DEV_PRICE_PER_LEVEL_RATE: 1.5           // 레벨당 연구비 증가율
};