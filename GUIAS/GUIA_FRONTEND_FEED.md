# 📱 Guía Completa: Sistema de Feed para App Android Nativa

## 📡 URLs Base del API
```
Desarrollo: http://localhost:3001/api/v1
Producción: https://diario.trigamer.xyz/api/v1
```

## 🎯 Funcionalidades Disponibles en el Backend

### ✅ **Sistema de Feed Unificado**
- `GET /api/v1/feed` - Todo el contenido (noticias + comunidad)
- `GET /api/v1/feed/noticias` - Solo noticias (type=1)
- `GET /api/v1/feed/comunidad` - Solo comunidad (type=2)
- `GET /api/v1/feed/stats` - Estadísticas del feed
- `GET /api/v1/feed/:id` - Elemento específico por feedId

### ✅ **Sistema de Likes y Comentarios Universales**
- `POST /api/v1/feed/:feedId/like` - Dar like (funciona para noticias Y comunidad)
- `DELETE /api/v1/feed/:feedId/like` - Quitar like
- `POST /api/v1/feed/:feedId/like/toggle` - Toggle like (añadir/quitar)
- `POST /api/v1/feed/:feedId/comments` - Crear comentario
- `GET /api/v1/feed/:feedId/comments` - Obtener comentarios

### ✅ **Endpoints Específicos para Apps Móviles**
- `GET /api/v1/mobile/config` - Configuración para apps móviles
- `GET /api/v1/mobile/health` - Health check optimizado para móviles
- `GET /api/v1/mobile/feed` - Feed optimizado para apps móviles
- `POST /api/v1/mobile/login` - Login optimizado para apps móviles

### ✅ **Sistema de Autenticación JWT**
- `POST /api/v1/auth/login` - Login con JWT
- `POST /api/v1/auth/register` - Registro de usuarios
- `GET /api/v1/users/profile` - Perfil del usuario actual

### ✅ **Sistema de Noticias**
- `GET /api/v1/news` - Listar noticias (paginado)
- `GET /api/v1/news/:id` - Obtener noticia específica
- `POST /api/v1/news` - Crear noticia (requiere auth)
- `PUT /api/v1/news/:id` - Actualizar noticia (requiere auth)
- `DELETE /api/v1/news/:id` - Eliminar noticia (requiere auth)

### ✅ **Sistema de Comunicaciones Multimedia**
- `POST /api/v1/com` - Crear comunicación con archivos
- `GET /api/v1/com` - Listar comunicaciones
- `GET /api/v1/com/:id` - Obtener comunicación específica
- Soporte para video (hasta 200MB) y múltiples imágenes (hasta 6)

### ✅ **Sistema de Usuarios y Roles**
- `GET /api/v1/users` - Listar usuarios (solo admin)
- `PUT /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario
- Roles: `administrador`, `colaborador`, `usuario`

## 🔧 Implementación en Android Studio

### 1. **Configuración de Dependencias**

```gradle
// build.gradle (app)
dependencies {
    // Retrofit para API calls
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    
    // OkHttp para logging y interceptors
    implementation 'com.squareup.okhttp3:okhttp:4.11.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    
    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    
    // Glide para imágenes
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    
    // Material Design
    implementation 'com.google.android.material:material:1.11.0'
}
```

### 2. **Configuración de la API Base**

```kotlin
// ApiConfig.kt
object ApiConfig {
    const val BASE_URL = "https://diario.trigamer.xyz"
    const val API_BASE_URL = "$BASE_URL/api/v1"
    
    // Endpoints principales
    const val MOBILE_CONFIG = "/mobile/config"
    const val MOBILE_HEALTH = "/mobile/health"
    const val MOBILE_FEED = "/mobile/feed"
    const val MOBILE_LOGIN = "/mobile/login"
    
    // Feed endpoints
    const val FEED_ENDPOINT = "/feed"
    const val FEED_NEWS = "/feed/noticias"
    const val FEED_COMMUNITY = "/feed/comunidad"
    const val FEED_STATS = "/feed/stats"
    
    // Auth endpoints
    const val AUTH_LOGIN = "/auth/login"
    const val AUTH_REGISTER = "/auth/register"
    
    // Timeouts
    const val CONNECT_TIMEOUT = 30L
    const val READ_TIMEOUT = 30L
}
```

### 3. **Modelos de Datos**

```kotlin
// FeedModels.kt
data class FeedItem(
    val id: Int,
    val titulo: String,
    val descripcion: String,
    val resumen: String?,
    val image_url: String?,
    val type: Int, // 1=noticia, 2=comunidad
    val original_id: Int,
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

// Auth Models
data class LoginRequest(
    val email: String,
    val password: String
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

// Mobile Config
data class MobileConfig(
    val api_version: String,
    val server_url: String,
    val features: MobileFeatures,
    val limits: MobileLimits
)

data class MobileFeatures(
    val feed_enabled: Boolean,
    val auth_enabled: Boolean,
    val upload_enabled: Boolean,
    val comments_enabled: Boolean,
    val likes_enabled: Boolean
)

data class MobileLimits(
    val max_image_size: Long,
    val max_video_size: Long,
    val max_upload_files: Int
)

// Comment Models
data class CommentRequest(val content: String)

data class Comment(
    val id: Int,
    val content: String,
    val autor: String,
    val user_id: Int,
    val created_at: String
)

// Like Response
data class LikeResponse(
    val liked: Boolean,
    val likes_count: Int,
    val message: String
)
```

### 4. **Interfaz de API Service**

```kotlin
// ApiService.kt
interface ApiService {
    // Endpoints móviles optimizados
    @GET("mobile/config")
    suspend fun getMobileConfig(): MobileConfig
    
    @GET("mobile/health")
    suspend fun getMobileHealth(): Map<String, String>
    
    @GET("mobile/feed")
    suspend fun getMobileFeed(@QueryMap params: Map<String, String>): FeedResponse
    
    @POST("mobile/login")
    suspend fun mobileLogin(@Body request: LoginRequest): AuthResponse
    
    // Feed endpoints
    @GET("feed")
    suspend fun getFeed(@QueryMap params: Map<String, String>): FeedResponse
    
    @GET("feed/noticias")
    suspend fun getNews(@QueryMap params: Map<String, String>): FeedResponse
    
    @GET("feed/comunidad")
    suspend fun getCommunity(@QueryMap params: Map<String, String>): FeedResponse
    
    @GET("feed/{id}")
    suspend fun getFeedItem(@Path("id") id: Int): FeedItem
    
    @GET("feed/stats")
    suspend fun getFeedStats(): Map<String, Any>
    
    // Likes y comentarios
    @POST("feed/{feedId}/like")
    suspend fun likeFeedItem(@Path("feedId") feedId: Int): Map<String, String>
    
    @DELETE("feed/{feedId}/like")
    suspend fun unlikeFeedItem(@Path("feedId") feedId: Int): Map<String, String>
    
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

data class RegisterRequest(
    val nombre: String,
    val email: String,
    val password: String,
    val role: String = "usuario"
)
```

### 5. **Cliente Retrofit Configurado**

```kotlin
// RetrofitClient.kt
object RetrofitClient {
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

### 6. **Repository Pattern**

```kotlin
// FeedRepository.kt
class FeedRepository {
    private val apiService = RetrofitClient.apiService
    
    suspend fun getMobileConfig(): Result<MobileConfig> {
        return try {
            val response = apiService.getMobileConfig()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getFeed(params: FeedParams): Result<FeedResponse> {
        return try {
            val queryParams = params.toMap()
            val response = apiService.getFeed(queryParams)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
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
    
    suspend fun likeFeedItem(feedId: Int): Result<Map<String, String>> {
        return try {
            val response = apiService.likeFeedItem(feedId)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun unlikeFeedItem(feedId: Int): Result<Map<String, String>> {
        return try {
            val response = apiService.unlikeFeedItem(feedId)
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
    
    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val request = LoginRequest(email, password)
            val response = apiService.login(request)
            RetrofitClient.setAuthToken(response.token)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun register(nombre: String, email: String, password: String): Result<AuthResponse> {
        return try {
            val request = RegisterRequest(nombre, email, password)
            val response = apiService.register(request)
            RetrofitClient.setAuthToken(response.token)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getUserProfile(): Result<UserData> {
        return try {
            val response = apiService.getUserProfile()
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

### 7. **ViewModel para el Feed**

```kotlin
// FeedViewModel.kt
class FeedViewModel : ViewModel() {
    private val repository = FeedRepository()
    
    private val _feedState = MutableLiveData<FeedState>()
    val feedState: LiveData<FeedState> = _feedState
    
    private val _currentTab = MutableLiveData<FeedTab>(FeedTab.TODO)
    val currentTab: LiveData<FeedTab> = _currentTab
    
    private val _likeState = MutableLiveData<LikeState>()
    val likeState: LiveData<LikeState> = _likeState
    
    private val _authState = MutableLiveData<AuthState>()
    val authState: LiveData<AuthState> = _authState
    
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
                FeedTab.TODO -> repository.getFeed(params)
                FeedTab.NOTICIAS -> repository.getNews(params)
                FeedTab.COMUNIDAD -> repository.getCommunity(params)
                else -> repository.getFeed(params)
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
            
            val result = repository.toggleLike(feedId)
            result.fold(
                onSuccess = { response ->
                    _likeState.value = LikeState.Success(response.liked, response.likes_count)
                    
                    // Actualizar el item en el feed
                    updateFeedItemLike(feedId, response.liked, response.likes_count)
                },
                onFailure = { error ->
                    _likeState.value = LikeState.Error(error.message ?: "Error al dar like")
                }
            )
        }
    }
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            
            val result = repository.login(email, password)
            result.fold(
                onSuccess = { response ->
                    _authState.value = AuthState.Success(response.user)
                },
                onFailure = { error ->
                    _authState.value = AuthState.Error(error.message ?: "Error de login")
                }
            )
        }
    }
    
    fun register(nombre: String, email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            
            val result = repository.register(nombre, email, password)
            result.fold(
                onSuccess = { response ->
                    _authState.value = AuthState.Success(response.user)
                },
                onFailure = { error ->
                    _authState.value = AuthState.Error(error.message ?: "Error de registro")
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

sealed class AuthState {
    object Loading : AuthState()
    data class Success(val user: UserData) : AuthState()
    data class Error(val message: String) : AuthState()
}
```

### 8. **Adapter para RecyclerView**

```kotlin
// FeedAdapter.kt
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

### 9. **Layout para Item del Feed**

```xml
<!-- item_feed.xml -->
<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView xmlns:android="http://schemas.android.com/apk/res/android"
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

        <ImageView
            android:id="@+id/iv_image"
            android:layout_width="match_parent"
            android:layout_height="200dp"
            android:scaleType="centerCrop"
            android:src="@drawable/placeholder_image" />

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
                android:textColor="@android:color/black"
                android:maxLines="2"
                android:ellipsize="end" />

            <TextView
                android:id="@+id/tv_description"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="8dp"
                android:textSize="14sp"
                android:maxLines="3"
                android:ellipsize="end" />

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="12dp"
                android:orientation="horizontal">

                <TextView
                    android:id="@+id/tv_user"
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:textSize="12sp"
                    android:textColor="@android:color/darker_gray" />

                <TextView
                    android:id="@+id/tv_date"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:textSize="12sp"
                    android:textColor="@android:color/darker_gray" />

            </LinearLayout>

            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="12dp"
                android:orientation="horizontal">

                <ImageButton
                    android:id="@+id/btn_like"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:background="?attr/selectableItemBackgroundBorderless"
                    android:src="@drawable/ic_heart_outline"
                    android:contentDescription="Like" />

                <TextView
                    android:id="@+id/tv_likes_count"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="4dp"
                    android:layout_marginEnd="16dp"
                    android:textSize="14sp" />

                <ImageButton
                    android:id="@+id/btn_comments"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:background="?attr/selectableItemBackgroundBorderless"
                    android:src="@drawable/ic_comment_outline"
                    android:contentDescription="Comentarios" />

                <TextView
                    android:id="@+id/tv_comments_count"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="4dp"
                    android:textSize="14sp" />

            </LinearLayout>

        </LinearLayout>

    </LinearLayout>

</androidx.cardview.widget.CardView>
```

### 10. **Activity Principal**

```kotlin
// MainActivity.kt
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
                    // Mostrar loading si es la primera carga
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
                is LikeState.Loading -> {
                    // Opcional: mostrar loading en el botón
                }
                is LikeState.Success -> {
                    // El adapter ya se actualiza automáticamente
                }
                is LikeState.Error -> {
                    showError(state.message)
                }
            }
        }
        
        feedViewModel.authState.observe(this) { state ->
            when (state) {
                is AuthState.Loading -> {
                    showLoading()
                }
                is AuthState.Success -> {
                    hideLoading()
                    showMessage("Bienvenido ${state.user.nombre}")
                }
                is AuthState.Error -> {
                    hideLoading()
                    showError(state.message)
                }
            }
        }
    }
    
    private fun openFeedDetail(item: FeedItem) {
        // Navegar a pantalla de detalle
        val intent = Intent(this, FeedDetailActivity::class.java)
        intent.putExtra("feed_id", item.id)
        startActivity(intent)
    }
    
    private fun openComments(item: FeedItem) {
        // Navegar a pantalla de comentarios
        val intent = Intent(this, CommentsActivity::class.java)
        intent.putExtra("feed_id", item.id)
        startActivity(intent)
    }
    
    private fun openProfile() {
        // Navegar a perfil
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
    
    private fun showMessage(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}
```

## 🔑 Puntos Clave para Android

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

### 4. **Manejo de errores**
```kotlin
try {
    val result = repository.toggleLike(feedId)
    result.fold(
        onSuccess = { response ->
            // Éxito
        },
        onFailure = { error ->
            when (error) {
                is HttpException -> {
                    when (error.code()) {
                        400 -> showMessage("Ya has dado like a este elemento")
                        401 -> navigateToLogin()
                        404 -> showMessage("Elemento no encontrado")
                        else -> showMessage("Error del servidor")
                    }
                }
                else -> showMessage("Error de conexión")
            }
        }
    )
} catch (e: Exception) {
    showMessage("Error inesperado")
}
```

## 🚨 Headers Requeridos

```kotlin
// Para likes y comentarios
headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json' // Solo para POST con body
}
```

## 📋 Checklist de Implementación Android

- [ ] ✅ Configurar dependencias de Retrofit y OkHttp
- [ ] ✅ Crear modelos de datos (FeedItem, AuthResponse, etc.)
- [ ] ✅ Configurar ApiService con todos los endpoints
- [ ] ✅ Configurar RetrofitClient con AuthInterceptor
- [ ] ✅ Crear FeedRepository con manejo de errores
- [ ] ✅ Crear FeedViewModel con estados de UI
- [ ] ✅ Crear FeedAdapter con click handlers
- [ ] ✅ Implementar layouts (item_feed.xml, activity_main.xml)
- [ ] ✅ Configurar MainActivity con navegación
- [ ] ✅ Probar likes en contenido de comunidad (type=2)
- [ ] ✅ Probar comentarios en contenido de comunidad (type=2)
- [ ] ✅ Verificar que conteos se actualizan automáticamente
- [ ] ✅ Implementar manejo de errores robusto
- [ ] ✅ Configurar autenticación JWT
- [ ] ✅ Probar en diferentes tamaños de pantalla

## 🎉 Beneficios

- ✅ **Una sola API** para likes/comentarios (noticias + comunidad)
- ✅ **Código más simple** - no necesitas distinguir tipos
- ✅ **Conteos automáticos** - `likes_count` y `comments_count` siempre actualizados
- ✅ **Mejor performance** - menos consultas, datos precalculados
- ✅ **Experiencia consistente** para usuarios
- ✅ **Endpoints móviles optimizados** para mejor rendimiento
- ✅ **Configuración automática** que la app puede obtener al iniciar

---

**¿Dudas?** El backend maneja automáticamente qué tabla usar según el tipo de contenido. Tu app Android solo necesita usar el `feedId` y las nuevas rutas. ¡Es así de simple! 🚀 