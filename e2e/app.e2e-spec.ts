import { PrestoEvolutionPage } from './app.po';

describe('presto-evolution App', function() {
  let page: PrestoEvolutionPage;

  beforeEach(() => {
    page = new PrestoEvolutionPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
