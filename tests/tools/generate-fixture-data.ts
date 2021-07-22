// Please run `yarn test --update-snapshots` after you execute this script.

import fs from 'fs'
import path from 'path'

import * as R from 'remeda'
import { v4 } from 'uuid'

// prettier-ignore
const presidents = [ 'George Washington', 'John Adams', 'Thomas Jefferson', 'James Madison', 'James Monroe', 'John Quincy Adams', 'Andrew Jackson', 'Martin Van Buren', 'William Henry Harrison', 'John Tyler', 'James K. Polk', 'Zachary Taylor', 'Millard Fillmore', 'Franklin Pierce', 'James Buchanan', 'Abraham Lincoln', 'Andrew Johnson', 'Ulysses S. Grant', 'Rutherford B. Hayes', 'James A. Garfield', 'Chester A. Arthur', 'Grover Cleveland', 'Benjamin Harrison', 'Grover Cleveland (2nd term)', 'William McKinley', 'Theodore Roosevelt', 'William Howard Taft', 'Woodrow Wilson', 'Warren G. Harding', 'Calvin Coolidge', 'Herbert Hoover', 'Franklin D. Roosevelt', 'Harry S. Truman', 'Dwight D. Eisenhower', 'John F. Kennedy', 'Lyndon B. Johnson', 'Richard Nixon', 'Gerald Ford', 'Jimmy Carter', 'Ronald Reagan', 'George H. W. Bush', 'Bill Clinton', 'George W. Bush', 'Barack Obama', 'Donal Trump', 'Joe Biden', ]

const users = presidents.map((name) => ({
  id: v4(),
  name,
}))

const posts = R.pipe(
  users,
  R.flatMap((user) =>
    R.pipe(
      R.range(1, 10),
      R.map((i) => ({
        id: v4(),
        userId: user.id,
        title: `${user.name}'s post - ${i}`,
      })),
    ),
  ),
)

fs.writeFileSync(
  path.resolve(__dirname, '../fixtures.json'),
  JSON.stringify({ users, posts }, undefined, 2),
  'utf8',
)
