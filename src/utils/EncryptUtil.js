import crypto from "crypto";


class EncryptUtil {

    constructor(key) {
        this.key = crypto.createHash("sha256").update(key).digest();
        this.iv = '4e5Wa71fYoT7MFEX';
    }

    cipher (mode, data) {
        const encipher = crypto[mode]("aes-256-cbc", this.key, this.iv);
        let encoded = encipher.update(data);
        encoded += encipher.final();
        return encoded;
    }

    encrypt (data) {
        return this.b64enc(this.cipher("createCipheriv", data));
    }

    decrypt (data) {
        return this.cipher("createDecipheriv", this.b64dec(data));
    }

    b64enc (data) {
        const b = new Buffer(data, "binary");
        return b.toString("base64");
    }

    b64dec (data) {
        const b = new Buffer(data, "base64");
        return b.toString("binary");
    }
}

export default EncryptUtil;