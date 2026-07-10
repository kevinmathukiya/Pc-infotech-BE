import { Query } from 'mongoose';

export class ApiFeatures<T> {
  public query: Query<T[], T>;
  public queryObj: Record<string, any>;
  private _appliedFilter: Record<string, any> = {};

  constructor(query: Query<T[], T>, queryObj: Record<string, any>) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    const queryObjCopy: Record<string, any> = {};
    
    // Normalize query object (handle both flat keys like "field[op]" and nested structures)
    Object.keys(this.queryObj).forEach((key) => {
      const match = key.match(/^(\w+)\[(gte|gt|lte|lt|in|nin|regex|options)\](?:\[\])?$/);
      if (match) {
        const [, field, op] = match;
        if (!queryObjCopy[field]) queryObjCopy[field] = {};
        
        let val = this.queryObj[key];
        // Ensure that for 'in' and 'nin' operators, the value is always parsed as an array
        if ((op === 'in' || op === 'nin') && !Array.isArray(val)) {
          val = [val];
        }
        queryObjCopy[field][op] = val;
      } else {
        queryObjCopy[key] = this.queryObj[key];
      }
    });

    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObjCopy[el]);

    let queryStr = JSON.stringify(queryObjCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in|nin|regex|options)\b/g, (match) => `$${match}`);

    const filterParsed: Record<string, any> = JSON.parse(queryStr);
    if (filterParsed.isDeleted === undefined) {
      filterParsed.isDeleted = false;
    }

    this._appliedFilter = filterParsed;
    this.query = this.query.find(filterParsed as any);
    return this;
  }

  search(searchFields: string[]) {
    if (this.queryObj.search && searchFields.length > 0) {
      const searchVal = this.queryObj.search;
      const searchConditions = searchFields.map((field) => ({
        [field]: { $regex: searchVal, $options: 'i' },
      }));
      this.query = this.query.find({ $or: searchConditions } as any);
    }
    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = String(this.queryObj.sort).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryObj.fields) {
      const fields = String(this.queryObj.fields).split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Math.max(Number(this.queryObj.page) || 1, 1);
    const limit = Math.max(Number(this.queryObj.limit) || 10, 1);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  getFilter(): Record<string, any> {
    return this._appliedFilter;
  }
}
