import bcrypt from 'bcrypt-nodejs';
import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccountCommand } from "./account.command.create";
import { AccountRepository } from "../repository/account.repository";
import { AccountEntity } from "../entity/account.entity";
import { Account } from "../model/account.model";
import { CreateAccountMapper } from '../mapper/account.mapper.create';
import { HttpException, HttpStatus } from "@nestjs/common";
import { v4 as uuid } from 'uuid';

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler implements ICommandHandler<CreateAccountCommand> {
  constructor(
    @InjectRepository(AccountEntity) private readonly repository: AccountRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateAccountCommand): Promise<void> {
    const tokens: Array<string> = uuid().split('-');
    const newAccountId: string = `${tokens[2]}${tokens[1]}${tokens[0]}${tokens[3]}${tokens[4]}`;

    await this.repository.findOne({ where: [{ accountId: newAccountId }, { email: command.email }]}).then((item) => {
      if (item) throw new HttpException('Conflict', HttpStatus.CONFLICT);
    });

    const account: Account = this.publisher.mergeObjectContext(
      new Account(newAccountId, command.name, command.email, bcrypt.hashSync(command.password), command.active),
    );
    account.commit();
    await this.repository.save(new CreateAccountMapper(account));
  }
}
