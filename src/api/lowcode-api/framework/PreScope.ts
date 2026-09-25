import { type FindOptions, Op } from 'sequelize';
import config from '../config';

export default {

  createEnvWhere(options: FindOptions) {
    options = options || {};
    if (config.ENV === 'pre') {
      options.where = {
        ...(options.where),
        env: 'pre',
      };
    } else {
      options.where = {
        ...(options.where),
        env: {
          [Op.not]: 'pre',
        },
      };
    }
    return options;
  },
};