const bcrypt = require('bcryptjs');

const hash = '$2a$10$lJc5czKcKqXZp4jIVKREdO.ivHiK12xBzxbe6MmMkX2Gd5pLtFjdK';
const password = 'password123';

const verify = async () => {
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Password Match:', isMatch);
};

verify();
