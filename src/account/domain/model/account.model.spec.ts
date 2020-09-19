import bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

import Account from './account.model';
import Password from 'src/account/domain/model/password.model';

describe('AccountModel', () => {
  describe('updatePassword', () => {
    it('should throw UnauthorizedException when password is not matched', () => {
      const password = new Password('encrypted', 'salt', new Date(), new Date())
      const account = new Account('id', 'email', password, new Date(), new Date());

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      expect(account.updatePassword('password', 'new password')).toThrow(UnauthorizedException);
    });

    it('should return void', () => {
      const password = new Password('encrypted', 'salt', new Date(), new Date())
      const account = new Account('id', 'email', password, new Date(), new Date());

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      expect(account.updatePassword('password', 'new password')).toEqual(undefined);
    });
  });

  describe('comparedPassword', () => {
    it('should return true when password is matched', () => {
      const password = new Password('encrypted', 'salt', new Date(), new Date())
      const account = new Account('id', 'email', password, new Date(), new Date());

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      expect(account.comparePassword('password')).toEqual(true);
    });

    it('should return false whdn password is not matched', () => {
      const password = new Password('encrypted', 'salt', new Date(), new Date())
      const account = new Account('id', 'email', password, new Date(), new Date());

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      expect(account.comparePassword('password')).toEqual(false);
    })
  })
});
