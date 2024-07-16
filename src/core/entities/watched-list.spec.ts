import { WatchedList } from './watched-list';

const makeSut = (items: number[]) => {
  class NumberWatchedList extends WatchedList<number> {
    compareItems(a: number, b: number): boolean {
      return a === b;
    }
  }
  return new NumberWatchedList(items);
};

describe('WatchedList', () => {
  it('should be able to create a watched list with initial items', () => {
    const sut = makeSut([1, 2, 3]);
    expect(sut.currentItems).toHaveLength(3);
  });

  it('should be able to add new items', () => {
    const sut = makeSut([1, 2, 3]);
    sut.add(4);
    expect(sut.currentItems).toHaveLength(4);
    expect(sut.getNewItems()).toEqual([4]);
  });

  it('should be able to remove new items', () => {
    const sut = makeSut([1, 2, 3]);
    sut.remove(2);
    expect(sut.currentItems).toHaveLength(2);
    expect(sut.getRemovedItems()).toEqual([2]);
  });

  it('should be able to add an item even if it was removed before', () => {
    const sut = makeSut([1, 2, 3]);
    sut.remove(2);
    sut.add(2);
    expect(sut.currentItems).toHaveLength(3);
    expect(sut.getRemovedItems()).toEqual([]);
    expect(sut.getNewItems()).toEqual([]);
  });

  it('should be able to remove an item even if it was added before', () => {
    const sut = makeSut([1, 2, 3]);
    sut.add(4);
    sut.remove(4);
    expect(sut.currentItems).toHaveLength(3);
    expect(sut.getRemovedItems()).toEqual([]);
    expect(sut.getNewItems()).toEqual([]);
  });

  it('should be able to update watched list items', () => {
    const sut = makeSut([1, 2, 3]);
    sut.update([1, 3, 5]);
    expect(sut.getRemovedItems()).toEqual([2]);
    expect(sut.getNewItems()).toEqual([5]);
  });
});
