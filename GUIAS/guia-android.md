# 📱 Guía Completa: Aplicación Android Nativa - Diario CdelU

## 🎯 Descripción General

Esta guía te ayudará a crear una aplicación Android nativa que replique la funcionalidad del frontend Vue.js existente. La app incluirá:

- **Feed unificado** con noticias y contenido de comunidad
- **Sistema de autenticación** con JWT
- **Likes y comentarios** universales
- **Diseño moderno** con Material Design 3
- **Navegación intuitiva** con pestañas
- **Modo oscuro/claro** automático
- **Infinite scroll** optimizado

## 🏗️ Arquitectura de la Aplicación

### Estructura de Paquetes
```
com.diariocdelu.android/
├── data/
│   ├── api/
│   ├── models/
│   ├── repository/
│   └── local/
├── domain/
│   ├── usecase/
│   └── models/
├── presentation/
│   ├── ui/
│   ├── viewmodel/
│   └── adapter/
├── core/
│   ├── network/
│   ├── utils/
│   └── constants/
└── di/
```

## 📱 Configuración Inicial

### 1. **Dependencias del Proyecto**

```gradle
// build.gradle (app)
dependencies {
    // Core Android
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.activity:activity-ktx:1.8.2'
    implementation 'androidx.fragment:fragment-ktx:1.6.2'
    
    // Material Design 3
    implementation 'com.google.android.material:material:1.11.0'
    
    // Navigation Component
    implementation 'androidx.navigation:navigation-fragment-ktx:2.7.6'
    implementation 'androidx.navigation:navigation-ui-ktx:2.7.6'
    
    // ViewModel y LiveData
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'
    
    // Retrofit para API
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    
    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    
    // Glide para imágenes
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    kapt 'com.github.bumptech.glide:compiler:4.16.0'
    
    // Hilt para inyección de dependencias
    implementation 'com.google.dagger:hilt-android:2.48'
    kapt 'com.google.dagger:hilt-compiler:2.48'
    
    // Room para base de datos local
    implementation 'androidx.room:room-runtime:2.6.1'
    implementation 'androidx.room:room-ktx:2.6.1'
    kapt 'androidx.room:room-compiler:2.6.1'
    
    // DataStore para preferencias
    implementation 'androidx.datastore:datastore-preferences:1.0.0'
    
    // SwipeRefreshLayout
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
    
    // Lottie para animaciones
    implementation 'com.airbnb.android:lottie:6.1.0'
}
```

### 2. **Configuración de la API**

```kotlin
// core/constants/ApiConfig.kt
object ApiConfig {
    const val BASE_URL = "https://diario.trigamer.xyz"
    const val API_BASE_URL = "$BASE_URL/api/v1"
    
    // Endpoints principales
    const val FEED_ENDPOINT = "/feed"
    const val FEED_NEWS = "/feed/noticias"
    const val FEED_COMMUNITY = "/feed/comunidad"
    const val FEED_STATS = "/feed/stats"
    
    // Auth endpoints
    const val AUTH_LOGIN = "/auth/login"
    const val AUTH_REGISTER = "/auth/register"
    const val USER_PROFILE = "/users/profile"
    
    // Feed actions
    const val FEED_LIKE = "/feed/{feedId}/like"
    const val FEED_COMMENTS = "/feed/{feedId}/comments"
    
    // Timeouts
    const val CONNECT_TIMEOUT = 30L
    const val READ_TIMEOUT = 30L
}
```

## 📊 Modelos de Datos

### 1. **Modelos del Feed**

```kotlin
// data/models/FeedModels.kt
data class FeedItem(
    val id: Int,                    // feedId (usar para likes/comments)
    val titulo: String,
    val descripcion: String,
    val resumen: String?,
    val image_url: String?,
    val type: Int,                  // 1=noticia, 2=comunidad
    val original_id: Int,           // ID en tabla original
    val user_id: Int?,
    val user_name: String?,
    val published_at: String?,
    val created_at: String,
    val updated_at: String,
    val original_url: String?,
    val is_oficial: Boolean?,
    val video_url: String?,
    val likes_count: Int,
    val comments_count: Int,
    val is_liked: Boolean = false
)

data class FeedResponse(
    val data: List<FeedItem>,
    val pagination: FeedPagination
)

data class FeedPagination(
    val total: Int,
    val page: Int,
    val limit: Int,
    val totalPages: Int,
    val hasNext: Boolean,
    val hasPrev: Boolean
)

data class FeedStats(
    val total: Int,
    val by_type: FeedTypeStats
)

data class FeedTypeStats(
    val news: FeedTypeCount,
    val community: FeedTypeCount
)

data class FeedTypeCount(
    val count: Int,
    val likes: Int,
    val comments: Int
)
```

### 2. **Modelos de Autenticación**

```kotlin
// data/models/AuthModels.kt
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val nombre: String,
    val email: String,
    val password: String,
    val role: String = "usuario"
)

data class AuthResponse(
    val token: String,
    val user: UserData
)

data class UserData(
    val id: Int,
    val nombre: String,
    val email: String,
    val role: String
)
```

### 3. **Modelos de Likes y Comentarios**

```kotlin
// data/models/InteractionModels.kt
data class LikeResponse(
    val liked: Boolean,
    val likes_count: Int,
    val message: String
)

data class Comment(
    val id: Int,
    val content: String,
    val autor: String,
    val user_id: Int,
    val created_at: String
)

data class CommentRequest(
    val content: String
)
```

## 🌐 Configuración de Red

### 1. **Cliente Retrofit**

```kotlin
// core/network/RetrofitClient.kt
@Singleton
class RetrofitClient @Inject constructor() {
    
    private val authInterceptor = AuthInterceptor()
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) {
            HttpLoggingInterceptor.Level.BODY
        } else {
            HttpLoggingInterceptor.Level.NONE
        }
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(ApiConfig.CONNECT_TIMEOUT, TimeUnit.SECONDS)
        .readTimeout(ApiConfig.READ_TIMEOUT, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(ApiConfig.API_BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val apiService: ApiService = retrofit.create(ApiService::class.java)
    
    fun setAuthToken(token: String) {
        authInterceptor.setAuthToken(token)
    }
    
    fun clearAuthToken() {
        authInterceptor.clearAuthToken()
    }
}

class AuthInterceptor : Interceptor {
    private var authToken: String? = null
    
    fun setAuthToken(token: String) {
        authToken = token
    }
    
    fun clearAuthToken() {
        authToken = null
    }
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        val newRequest = if (authToken != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $authToken")
                .build()
        } else {
            originalRequest
        }
        
        return chain.proceed(newRequest)
    }
}
```

### 2. **Interfaz de API Service**

```kotlin
// data/api/ApiService.kt
interface ApiService {
    // Feed endpoints
    @GET("feed")
    suspend fun getFeed(@QueryMap params: Map<String, String>): FeedResponse
    
    @GET("feed/noticias")
    suspend fun getNews(@QueryMap params: Map<String, String>): FeedResponse
    
    @GET("feed/comunidad")
    suspend fun getCommunity(@QueryMap params: Map<String, String>): FeedResponse
    
    @GET("feed/stats")
    suspend fun getFeedStats(): FeedStats
    
    @GET("feed/{id}")
    suspend fun getFeedItem(@Path("id") id: Int): FeedItem
    
    // Likes y comentarios
    @POST("feed/{feedId}/like/toggle")
    suspend fun toggleLike(@Path("feedId") feedId: Int): LikeResponse
    
    @POST("feed/{feedId}/comments")
    suspend fun createComment(
        @Path("feedId") feedId: Int,
        @Body request: CommentRequest
    ): Map<String, Any>
    
    @GET("feed/{feedId}/comments")
    suspend fun getComments(@Path("feedId") feedId: Int): List<Comment>
    
    // Auth
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse
    
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse
    
    @GET("users/profile")
    suspend fun getUserProfile(): UserData
}
```

## 🗄️ Repositorios

### 1. **Feed Repository**

```kotlin
// data/repository/FeedRepository.kt
@Singleton
class FeedRepository @Inject constructor(
    private val apiService: ApiService,
    private val feedDao: FeedDao
) {
    
    suspend fun getFeed(params: FeedParams): Result<FeedResponse> {
        return try {
            val queryParams = params.toMap()
            val response = apiService.getFeed(queryParams)
            
            // Guardar en caché local
            feedDao.insertFeedItems(response.data)
            
            Result.success(response)
        } catch (e: Exception) {
            // Intentar obtener desde caché
            val cachedData = feedDao.getFeedItems(params.type)
            if (cachedData.isNotEmpty()) {
                val cachedResponse = FeedResponse(
                    data = cachedData,
                    pagination = FeedPagination(0, 1, 10, 1, false, false)
                )
                Result.success(cachedResponse)
            } else {
                Result.failure(e)
            }
        }
    }
    
    suspend fun getNews(params: FeedParams): Result<FeedResponse> {
        return try {
            val queryParams = params.toMap()
            val response = apiService.getNews(queryParams)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCommunity(params: FeedParams): Result<FeedResponse> {
        return try {
            val queryParams = params.toMap()
            val response = apiService.getCommunity(queryParams)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun toggleLike(feedId: Int): Result<LikeResponse> {
        return try {
            val response = apiService.toggleLike(feedId)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createComment(feedId: Int, content: String): Result<Map<String, Any>> {
        return try {
            val request = CommentRequest(content)
            val response = apiService.createComment(feedId, request)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getComments(feedId: Int): Result<List<Comment>> {
        return try {
            val response = apiService.getComments(feedId)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

data class FeedParams(
    val page: Int = 1,
    val limit: Int = 10,
    val type: Int? = null,
    val sort: String = "published_at",
    val order: String = "desc"
) {
    fun toMap(): Map<String, String> {
        return mapOf(
            "page" to page.toString(),
            "limit" to limit.toString(),
            "sort" to sort,
            "order" to order
        ).apply {
            type?.let { put("type", it.toString()) }
        }
    }
}
```

## 🎨 UI Components

### 1. **Activity Principal**

```kotlin
// presentation/ui/MainActivity.kt
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val feedViewModel: FeedViewModel by viewModels()
    private lateinit var feedAdapter: FeedAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupViews()
        setupNavigation()
        observeViewModel()
    }
    
    private fun setupViews() {
        feedAdapter = FeedAdapter(
            onItemClick = { item -> openFeedDetail(item) },
            onLikeClick = { item -> feedViewModel.toggleLike(item.id) },
            onCommentClick = { item -> openComments(item) }
        )
        
        binding.recyclerView.apply {
            adapter = feedAdapter
            layoutManager = LinearLayoutManager(this@MainActivity)
            addItemDecoration(
                DividerItemDecoration(context, DividerItemDecoration.VERTICAL)
            )
        }
        
        binding.swipeRefresh.setOnRefreshListener {
            feedViewModel.refreshFeed()
        }
    }
    
    private fun setupNavigation() {
        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> {
                    feedViewModel.switchTab(FeedTab.TODO)
                    true
                }
                R.id.nav_news -> {
                    feedViewModel.switchTab(FeedTab.NOTICIAS)
                    true
                }
                R.id.nav_community -> {
                    feedViewModel.switchTab(FeedTab.COMUNIDAD)
                    true
                }
                R.id.nav_profile -> {
                    openProfile()
                    true
                }
                else -> false
            }
        }
    }
    
    private fun observeViewModel() {
        feedViewModel.feedState.observe(this) { state ->
            binding.swipeRefresh.isRefreshing = false
            
            when (state) {
                is FeedState.Loading -> {
                    if (feedAdapter.itemCount == 0) {
                        showLoading()
                    }
                }
                is FeedState.Success -> {
                    hideLoading()
                    feedAdapter.updateItems(state.data)
                }
                is FeedState.Error -> {
                    hideLoading()
                    showError(state.message)
                }
            }
        }
        
        feedViewModel.likeState.observe(this) { state ->
            when (state) {
                is LikeState.Success -> {
                    // El adapter se actualiza automáticamente
                }
                is LikeState.Error -> {
                    showError(state.message)
                }
                else -> {}
            }
        }
    }
    
    private fun openFeedDetail(item: FeedItem) {
        val intent = Intent(this, FeedDetailActivity::class.java)
        intent.putExtra("feed_id", item.id)
        startActivity(intent)
    }
    
    private fun openComments(item: FeedItem) {
        val intent = Intent(this, CommentsActivity::class.java)
        intent.putExtra("feed_id", item.id)
        startActivity(intent)
    }
    
    private fun openProfile() {
        val intent = Intent(this, ProfileActivity::class.java)
        startActivity(intent)
    }
    
    private fun showLoading() {
        binding.progressBar.visibility = View.VISIBLE
    }
    
    private fun hideLoading() {
        binding.progressBar.visibility = View.GONE
    }
    
    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}
```

### 2. **Feed Adapter**

```kotlin
// presentation/adapter/FeedAdapter.kt
class FeedAdapter(
    private val onItemClick: (FeedItem) -> Unit,
    private val onLikeClick: (FeedItem) -> Unit,
    private val onCommentClick: (FeedItem) -> Unit
) : RecyclerView.Adapter<FeedAdapter.FeedViewHolder>() {
    
    private var items = listOf<FeedItem>()
    
    fun updateItems(newItems: List<FeedItem>) {
        items = newItems
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FeedViewHolder {
        val binding = ItemFeedBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return FeedViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: FeedViewHolder, position: Int) {
        holder.bind(items[position])
    }
    
    override fun getItemCount() = items.size
    
    inner class FeedViewHolder(
        private val binding: ItemFeedBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(item: FeedItem) {
            binding.apply {
                tvTitle.text = item.titulo
                tvDescription.text = item.descripcion
                tvUser.text = item.user_name ?: "Usuario"
                tvDate.text = formatDate(item.created_at)
                tvLikesCount.text = item.likes_count.toString()
                tvCommentsCount.text = item.comments_count.toString()
                
                // Configurar like button
                btnLike.isSelected = item.is_liked
                btnLike.setOnClickListener { onLikeClick(item) }
                
                // Configurar comentarios
                btnComments.setOnClickListener { onCommentClick(item) }
                
                // Cargar imagen
                item.image_url?.let { url ->
                    Glide.with(ivImage.context)
                        .load(url)
                        .placeholder(R.drawable.placeholder_image)
                        .error(R.drawable.error_image)
                        .into(ivImage)
                }
                
                // Configurar click en item
                root.setOnClickListener { onItemClick(item) }
                
                // Configurar tipo de contenido
                setupContentType(item)
            }
        }
        
        private fun setupContentType(item: FeedItem) {
            binding.apply {
                when (item.type) {
                    1 -> { // Noticia
                        tvType.text = "📰 Noticia"
                        tvType.setBackgroundResource(R.drawable.bg_news_type)
                    }
                    2 -> { // Comunidad
                        tvType.text = "👥 Comunidad"
                        tvType.setBackgroundResource(R.drawable.bg_community_type)
                    }
                }
                
                // Badge oficial para noticias
                badgeOfficial.visibility = if (item.is_oficial == true) View.VISIBLE else View.GONE
                
                // Indicador de video
                indicatorVideo.visibility = if (item.video_url != null) View.VISIBLE else View.GONE
            }
        }
        
        private fun formatDate(dateString: String): String {
            return try {
                val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                val outputFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
                val date = inputFormat.parse(dateString)
                outputFormat.format(date ?: Date())
            } catch (e: Exception) {
                dateString
            }
        }
    }
}
```

### 3. **Layout del Item del Feed**

```xml
<!-- res/layout/item_feed.xml -->
<?xml version="1.0" encoding="utf-8"?>
<com.google.android.material.card.MaterialCardView 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="8dp"
    app:cardCornerRadius="12dp"
    app:cardElevation="4dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <!-- Header -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:padding="16dp"
            android:gravity="center_vertical">

            <TextView
                android:id="@+id/tv_type"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textSize="12sp"
                android:textColor="@color/white"
                android:padding="4dp"
                android:layout_marginEnd="8dp"/>

            <TextView
                android:id="@+id/tv_user"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:textSize="14sp"
                android:textColor="@color/text_secondary"/>

            <TextView
                android:id="@+id/tv_date"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textSize="12sp"
                android:textColor="@color/text_secondary"/>

            <TextView
                android:id="@+id/badge_official"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="🏛️ Oficial"
                android:textSize="10sp"
                android:background="@drawable/bg_official_badge"
                android:padding="4dp"
                android:visibility="gone"
                android:layout_marginStart="8dp"/>

        </LinearLayout>

        <!-- Imagen -->
        <ImageView
            android:id="@+id/iv_image"
            android:layout_width="match_parent"
            android:layout_height="200dp"
            android:scaleType="centerCrop"
            android:src="@drawable/placeholder_image"
            android:visibility="gone"/>

        <!-- Contenido -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="16dp">

            <TextView
                android:id="@+id/tv_title"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:textSize="18sp"
                android:textStyle="bold"
                android:textColor="@color/text_primary"
                android:maxLines="2"
                android:ellipsize="end"/>

            <TextView
                android:id="@+id/tv_description"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="8dp"
                android:textSize="14sp"
                android:maxLines="3"
                android:ellipsize="end"/>

            <!-- Indicador de video -->
            <LinearLayout
                android:id="@+id/indicator_video"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:orientation="horizontal"
                android:layout_marginTop="8dp"
                android:visibility="gone">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="🎬"
                    android:textSize="16sp"/>

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Incluye video"
                    android:textSize="12sp"
                    android:layout_marginStart="4dp"/>

            </LinearLayout>

        </LinearLayout>

        <!-- Footer con estadísticas y acciones -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:padding="16dp"
            android:gravity="center_vertical">

            <!-- Estadísticas -->
            <LinearLayout
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:orientation="horizontal">

                <LinearLayout
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal"
                    android:layout_marginEnd="16dp">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="❤️"
                        android:textSize="16sp"/>

                    <TextView
                        android:id="@+id/tv_likes_count"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:textSize="14sp"
                        android:layout_marginStart="4dp"/>

                </LinearLayout>

                <LinearLayout
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="💬"
                        android:textSize="16sp"/>

                    <TextView
                        android:id="@+id/tv_comments_count"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:textSize="14sp"
                        android:layout_marginStart="4dp"/>

                </LinearLayout>

            </LinearLayout>

            <!-- Acciones -->
            <LinearLayout
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:orientation="horizontal">

                <ImageButton
                    android:id="@+id/btn_like"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:background="?attr/selectableItemBackgroundBorderless"
                    android:src="@drawable/ic_heart_outline"
                    android:contentDescription="Like"
                    android:layout_marginEnd="8dp"/>

                <ImageButton
                    android:id="@+id/btn_comments"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:background="?attr/selectableItemBackgroundBorderless"
                    android:src="@drawable/ic_comment_outline"
                    android:contentDescription="Comentarios"
                    android:layout_marginEnd="8dp"/>

                <ImageButton
                    android:id="@+id/btn_share"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:background="?attr/selectableItemBackgroundBorderless"
                    android:src="@drawable/ic_share_outline"
                    android:contentDescription="Compartir"/>

            </LinearLayout>

        </LinearLayout>

    </LinearLayout>

</com.google.android.material.card.MaterialCardView>
```

## 🎯 ViewModels

### 1. **Feed ViewModel**

```kotlin
// presentation/viewmodel/FeedViewModel.kt
@HiltViewModel
class FeedViewModel @Inject constructor(
    private val feedRepository: FeedRepository
) : ViewModel() {
    
    private val _feedState = MutableLiveData<FeedState>()
    val feedState: LiveData<FeedState> = _feedState
    
    private val _currentTab = MutableLiveData<FeedTab>(FeedTab.TODO)
    val currentTab: LiveData<FeedTab> = _currentTab
    
    private val _likeState = MutableLiveData<LikeState>()
    val likeState: LiveData<LikeState> = _likeState
    
    private var currentPage = 1
    private var isLoading = false
    
    init {
        loadFeed()
    }
    
    fun loadFeed(refresh: Boolean = false) {
        if (isLoading) return
        
        if (refresh) {
            currentPage = 1
        }
        
        isLoading = true
        _feedState.value = FeedState.Loading
        
        viewModelScope.launch {
            val params = FeedParams(
                page = currentPage,
                limit = 10,
                sort = "published_at",
                order = "desc"
            )
            
            val result = when (_currentTab.value) {
                FeedTab.TODO -> feedRepository.getFeed(params)
                FeedTab.NOTICIAS -> feedRepository.getNews(params)
                FeedTab.COMUNIDAD -> feedRepository.getCommunity(params)
                else -> feedRepository.getFeed(params)
            }
            
            result.fold(
                onSuccess = { response ->
                    val newState = if (refresh) {
                        FeedState.Success(response.data)
                    } else {
                        val currentData = _feedState.value?.data ?: emptyList()
                        FeedState.Success(currentData + response.data)
                    }
                    _feedState.value = newState
                    currentPage++
                },
                onFailure = { error ->
                    _feedState.value = FeedState.Error(error.message ?: "Error desconocido")
                }
            )
            
            isLoading = false
        }
    }
    
    fun switchTab(tab: FeedTab) {
        _currentTab.value = tab
        currentPage = 1
        loadFeed(refresh = true)
    }
    
    fun refreshFeed() {
        loadFeed(refresh = true)
    }
    
    fun toggleLike(feedId: Int) {
        viewModelScope.launch {
            _likeState.value = LikeState.Loading
            
            val result = feedRepository.toggleLike(feedId)
            result.fold(
                onSuccess = { response ->
                    _likeState.value = LikeState.Success(response.liked, response.likes_count)
                    updateFeedItemLike(feedId, response.liked, response.likes_count)
                },
                onFailure = { error ->
                    _likeState.value = LikeState.Error(error.message ?: "Error al dar like")
                }
            )
        }
    }
    
    private fun updateFeedItemLike(feedId: Int, liked: Boolean, likesCount: Int) {
        val currentData = _feedState.value?.data ?: return
        val updatedData = currentData.map { item ->
            if (item.id == feedId) {
                item.copy(
                    is_liked = liked,
                    likes_count = likesCount
                )
            } else {
                item
            }
        }
        _feedState.value = FeedState.Success(updatedData)
    }
}

enum class FeedTab {
    TODO, NOTICIAS, COMUNIDAD
}

sealed class FeedState {
    object Loading : FeedState()
    data class Success(val data: List<FeedItem>) : FeedState()
    data class Error(val message: String) : FeedState()
}

sealed class LikeState {
    object Loading : LikeState()
    data class Success(val liked: Boolean, val likesCount: Int) : LikeState()
    data class Error(val message: String) : LikeState()
}
```

## 🎨 Temas y Estilos

### 1. **Tema Principal**

```xml
<!-- res/values/themes.xml -->
<resources>
    <style name="Theme.DiarioCdelU" parent="Theme.Material3.DayNight">
        <!-- Colores primarios -->
        <item name="colorPrimary">@color/blue_500</item>
        <item name="colorPrimaryVariant">@color/blue_700</item>
        <item name="colorOnPrimary">@color/white</item>
        
        <!-- Colores secundarios -->
        <item name="colorSecondary">@color/purple_500</item>
        <item name="colorSecondaryVariant">@color/purple_700</item>
        <item name="colorOnSecondary">@color/white</item>
        
        <!-- Colores de superficie -->
        <item name="colorSurface">@color/surface_light</item>
        <item name="colorOnSurface">@color/text_primary_light</item>
        
        <!-- Colores de fondo -->
        <item name="android:colorBackground">@color/background_light</item>
        <item name="colorOnBackground">@color/text_primary_light</item>
        
        <!-- Colores de error -->
        <item name="colorError">@color/red_500</item>
        <item name="colorOnError">@color/white</item>
        
        <!-- Configuración de barras -->
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLightStatusBar">true</item>
        
        <!-- Configuración de formas -->
        <item name="shapeAppearanceSmallComponent">@style/ShapeAppearance.SmallComponent</item>
        <item name="shapeAppearanceMediumComponent">@style/ShapeAppearance.MediumComponent</item>
        <item name="shapeAppearanceLargeComponent">@style/ShapeAppearance.LargeComponent</item>
    </style>
</resources>
```

### 2. **Tema Oscuro**

```xml
<!-- res/values-night/themes.xml -->
<resources>
    <style name="Theme.DiarioCdelU" parent="Theme.Material3.DayNight">
        <!-- Colores primarios -->
        <item name="colorPrimary">@color/blue_200</item>
        <item name="colorPrimaryVariant">@color/blue_700</item>
        <item name="colorOnPrimary">@color/black</item>
        
        <!-- Colores secundarios -->
        <item name="colorSecondary">@color/purple_200</item>
        <item name="colorSecondaryVariant">@color/purple_700</item>
        <item name="colorOnSecondary">@color/black</item>
        
        <!-- Colores de superficie -->
        <item name="colorSurface">@color/surface_dark</item>
        <item name="colorOnSurface">@color/text_primary_dark</item>
        
        <!-- Colores de fondo -->
        <item name="android:colorBackground">@color/background_dark</item>
        <item name="colorOnBackground">@color/text_primary_dark</item>
        
        <!-- Colores de error -->
        <item name="colorError">@color/red_200</item>
        <item name="colorOnError">@color/black</item>
        
        <!-- Configuración de barras -->
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>
```

## 🔧 Configuración de Hilt

### 1. **Módulo de Red**

```kotlin
// di/NetworkModule.kt
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideRetrofitClient(): RetrofitClient {
        return RetrofitClient()
    }
    
    @Provides
    @Singleton
    fun provideApiService(retrofitClient: RetrofitClient): ApiService {
        return retrofitClient.apiService
    }
    
    @Provides
    @Singleton
    fun provideFeedRepository(
        apiService: ApiService,
        feedDao: FeedDao
    ): FeedRepository {
        return FeedRepository(apiService, feedDao)
    }
}
```

### 2. **Módulo de Base de Datos**

```kotlin
// di/DatabaseModule.kt
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "diario_cdelu_db"
        ).build()
    }
    
    @Provides
    fun provideFeedDao(database: AppDatabase): FeedDao {
        return database.feedDao()
    }
}
```

## 📱 Navegación

### 1. **Graph de Navegación**

```xml
<!-- res/navigation/nav_graph.xml -->
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/nav_graph"
    app:startDestination="@id/homeFragment">

    <fragment
        android:id="@+id/homeFragment"
        android:name="com.diariocdelu.android.presentation.ui.HomeFragment"
        android:label="Inicio" />

    <fragment
        android:id="@+id/feedDetailFragment"
        android:name="com.diariocdelu.android.presentation.ui.FeedDetailFragment"
        android:label="Detalle">
        <argument
            android:name="feedId"
            app:argType="integer" />
    </fragment>

    <fragment
        android:id="@+id/commentsFragment"
        android:name="com.diariocdelu.android.presentation.ui.CommentsFragment"
        android:label="Comentarios">
        <argument
            android:name="feedId"
            app:argType="integer" />
    </fragment>

    <fragment
        android:id="@+id/profileFragment"
        android:name="com.diariocdelu.android.presentation.ui.ProfileFragment"
        android:label="Perfil" />

    <fragment
        android:id="@+id/loginFragment"
        android:name="com.diariocdelu.android.presentation.ui.LoginFragment"
        android:label="Iniciar Sesión" />

</navigation>
```

## 🚀 Funcionalidades Clave

### 1. **Sistema de Feed Unificado**
- ✅ Feed que combina noticias y contenido de comunidad
- ✅ Pestañas para filtrar por tipo de contenido
- ✅ Infinite scroll optimizado
- ✅ Caché local para offline

### 2. **Sistema de Likes y Comentarios**
- ✅ Likes universales (funciona para noticias y comunidad)
- ✅ Comentarios universales
- ✅ Actualización en tiempo real de contadores
- ✅ Animaciones suaves

### 3. **Autenticación JWT**
- ✅ Login/Registro
- ✅ Almacenamiento seguro de tokens
- ✅ Interceptor automático para requests
- ✅ Manejo de sesiones expiradas

### 4. **Diseño Moderno**
- ✅ Material Design 3
- ✅ Modo oscuro/claro automático
- ✅ Animaciones fluidas
- ✅ Diseño responsive

### 5. **Optimizaciones**
- ✅ Lazy loading de imágenes
- ✅ Caché de datos
- ✅ Manejo de errores robusto
- ✅ Estados de carga

## 📋 Checklist de Implementación

- [ ] ✅ Configurar proyecto Android Studio
- [ ] ✅ Agregar dependencias necesarias
- [ ] ✅ Configurar Hilt para inyección de dependencias
- [ ] ✅ Crear modelos de datos
- [ ] ✅ Configurar Retrofit y API Service
- [ ] ✅ Implementar repositorios
- [ ] ✅ Crear ViewModels
- [ ] ✅ Diseñar layouts con Material Design 3
- [ ] ✅ Implementar adapters para RecyclerView
- [ ] ✅ Configurar navegación
- [ ] ✅ Implementar sistema de autenticación
- [ ] ✅ Agregar funcionalidad de likes y comentarios
- [ ] ✅ Implementar infinite scroll
- [ ] ✅ Agregar caché local
- [ ] ✅ Configurar temas claro/oscuro
- [ ] ✅ Probar en diferentes dispositivos
- [ ] ✅ Optimizar performance
- [ ] ✅ Implementar manejo de errores
- [ ] ✅ Agregar animaciones
- [ ] ✅ Configurar CI/CD

## 🎯 Puntos Clave para Android

### 1. **feedId es la clave**
```kotlin
// ✅ CORRECTO: Usar item.id (feedId de content_feed)
feedViewModel.toggleLike(item.id)

// ❌ INCORRECTO: No usar original_id
// feedViewModel.toggleLike(item.original_id)
```

### 2. **Mismo código para noticias y comunidad**
```kotlin
// Funciona igual para type=1 (noticias) y type=2 (comunidad)
fun handleLike(feedItem: FeedItem) {
    feedViewModel.toggleLike(feedItem.id) // Sin importar el tipo
}
```

### 3. **Estructura de respuesta del feed**
```kotlin
data class FeedItem(
    val id: Int,              // ← Este es el feedId que necesitas
    val type: Int,            // 1=noticia, 2=comunidad
    val original_id: Int,     // ID en tabla original (no usar para likes/comments)
    val titulo: String,
    val likes_count: Int,     // Precalculado
    val comments_count: Int,  // Precalculado
    val is_liked: Boolean     // Estado del like del usuario actual
)
```

## 🎉 Beneficios de la Implementación Android

- ✅ **Una sola API** para likes/comentarios (noticias + comunidad)
- ✅ **Código más simple** - no necesitas distinguir tipos
- ✅ **Conteos automáticos** - `likes_count` y `comments_count` siempre actualizados
- ✅ **Mejor performance** - menos consultas, datos precalculados
- ✅ **Experiencia consistente** para usuarios
- ✅ **Diseño nativo** optimizado para Android
- ✅ **Offline support** con caché local
- ✅ **Animaciones fluidas** nativas

---

**¡Listo para implementar!** Esta guía te proporciona todo lo necesario para crear una aplicación Android nativa que replique la funcionalidad del frontend Vue.js existente. 🚀 