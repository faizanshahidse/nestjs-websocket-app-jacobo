class BankModule {
  static bankAccount(imports, useFactory, inject) {
    const accountProvider = {
      provide: 'ACCOUNT_KEY',
      useFactory: () => {},
    };

    return {};
  }
}
