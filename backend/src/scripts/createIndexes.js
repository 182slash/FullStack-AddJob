/**
 * Create all MongoDB indexes for production performance
 * Run: node src/scripts/createIndexes.js
 */
require('dotenv').config()
const mongoose = require('mongoose')

async function createIndexes() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected\n')

  const db = mongoose.connection.db

  // ── Users ────────────────────────────────────────────
  await db.collection('users').createIndexes([
    { key: { email: 1 },    unique: true,  name: 'email_unique'  },
    { key: { role: 1 },                    name: 'role'          },
    { key: { googleId: 1 }, sparse: true,  name: 'google_sparse' },
    { key: { createdAt: -1 },              name: 'created_desc'  },
  ])
  console.log('✅ users indexes')

  // ── Jobs ─────────────────────────────────────────────
  await db.collection('jobs').createIndexes([
    { key: { isActive: 1, createdAt: -1 },              name: 'active_date'    },
    { key: { company: 1, isActive: 1 },                 name: 'company_active' },
    { key: { postedBy: 1 },                             name: 'postedby'       },
    { key: { category: 1, isActive: 1 },                name: 'category_active'},
    { key: { location: 1, isActive: 1 },                name: 'location_active'},
    { key: { type: 1, isActive: 1 },                    name: 'type_active'    },
    { key: { isFeatured: 1, isActive: 1 },              name: 'featured_active'},
    { key: { salaryMin: 1, salaryMax: 1 },              name: 'salary_range'   },
    { key: { deadline: 1 }, sparse: true,               name: 'deadline_sparse'},
    { key: { title: 'text', description: 'text', tags: 'text' },
      weights: { title: 10, tags: 5, description: 1 },  name: 'text_search'    },
  ])
  console.log('✅ jobs indexes')

  // ── Applications ─────────────────────────────────────
  await db.collection('applications').createIndexes([
    { key: { job: 1, applicant: 1 }, unique: true, name: 'job_applicant_unique' },
    { key: { applicant: 1, status: 1 },             name: 'applicant_status'    },
    { key: { job: 1, status: 1 },                   name: 'job_status'          },
    { key: { company: 1 },                          name: 'company'             },
    { key: { createdAt: -1 },                       name: 'created_desc'        },
  ])
  console.log('✅ applications indexes')

  // ── Companies ─────────────────────────────────────────
  await db.collection('companies').createIndexes([
    { key: { owner: 1 }, unique: true, name: 'owner_unique' },
    { key: { slug: 1 },  unique: true, name: 'slug_unique'  },
    { key: { industry: 1, isActive: 1 }, name: 'industry'   },
    { key: { name: 'text', description: 'text' }, name: 'text_search' },
  ])
  console.log('✅ companies indexes')

  // ── Articles ──────────────────────────────────────────
  await db.collection('articles').createIndexes([
    { key: { slug: 1 }, unique: true, name: 'slug_unique'      },
    { key: { category: 1, isPublished: 1 }, name: 'cat_pub'    },
    { key: { publishedAt: -1 },             name: 'published'  },
    { key: { title: 'text', content: 'text', tags: 'text' }, name: 'text_search' },
  ])
  console.log('✅ articles indexes')

  console.log('\n🎉 All indexes created successfully')
  await mongoose.disconnect()
  process.exit(0)
}

createIndexes().catch(err => {
  console.error('❌', err.message)
  process.exit(1)
})
