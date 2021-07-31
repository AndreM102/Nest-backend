import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { OpenAccountCommand } from 'src/accounts/application/commands/open-account.command';
import { InjectionToken } from 'src/accounts/application/injection.token';

import { Account } from 'src/accounts/domain/account';
import { AccountRepository } from 'src/accounts/domain/repository';

@CommandHandler(OpenAccountCommand)
export class OpenAccountHandler
  implements ICommandHandler<OpenAccountCommand, void>
{
  constructor(
    @Inject(InjectionToken.ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: OpenAccountCommand): Promise<void> {
    const data = new Account({ id: await this.accountRepository.newId(), name: command.name });

    const account = this.eventPublisher.mergeObjectContext(data);

    account.setPassword(command.password);

    account.open();

    await this.accountRepository.save(account);

    account.commit();
  }
}
