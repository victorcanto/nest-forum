import { Slug } from './slug';

test('should create a slug', () => {
  const slug = Slug.createFromText('Example question title');
  expect(slug.value).toEqual('example-question-title');
});
